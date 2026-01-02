# Itinera AI: System Architecture & Design

This document provides a comprehensive overview of the **Itinera AI** backend service, detailing its High-Level Design (HLD), component architecture, and core workflows.

## 1. High-Level Design (HLD)

Itinera AI is built as a modular, asynchronous microservice using **FastAPI**. It leverages external GenAI providers (Google Gemini, Perplexity) to generate content and acts as an orchestration layer between user intent and AI capability.

```mermaid
graph TD
    Client[Client / Frontend]
    
    subgraph "Itinera AI Service"
        API[API Gateway / Server.py]
        
        subgraph "Endpoints Layer"
            EP_Plan[Planner Endpoint]
            EP_Place[Places Endpoint]
            EP_Acct[Accounts Endpoint]
        end
        
        subgraph "Core Engine"
            AI[AI Core (Gemini)]
            Search[Search Core (Perplexity)]
        end
        
        subgraph "Utilities"
            Img[Image Gen & Storage]
            Task[Background Task Mgr]
        end
    end
    
    Client -->|HTTP/REST| API
    API --> EP_Plan
    API --> EP_Place
    API --> EP_Acct
    
    EP_Plan --> AI
    EP_Plan --> Search
    EP_Plan --> Img
    
    EP_Place --> Task
    Task --> AI
    
    AI -->|gRPC/REST| Ext_Gemini[Google Gemini API]
    Search -->|REST| Ext_Perp[Perplexity API]
```

### Key Architectural Decisions
*   **Asynchronous Core**: Heavily uses `asyncio` to handle I/O-bound AI requests without blocking the main server thread.
*   **Stateless REST API**: The server does not maintain session state (except for in-memory mock storage for some endpoints), making it horizontally scalable.
*   **Structured AI Responses**: Uses strict schemas (Pydantic/JSON) to force LLMs to output machine-readable data, eliminating markdown parsing fragility.
*   **Parallel Processing**: Image generation and batch destination processing run concurrently to minimize latency.

## 2. Component Detail

### 2.1 Server & Entry Point (`server.py`)
*   Initializes the FastAPI application.
*   Configures CORS and Middleware.
*   Mounts static file directories for serving generated images.
*   Aggregates routers from the `endpoints/` module.

### 2.2 Endpoints Layer (`endpoints/`)
*   **`planner.py`**: The brain of the operation. Handles real-time itinerary generation, travel options retrieval, and specific food/place recommendations. Use `ai_core` and `search_core`.
*   **`places.py`**: Handles batch processing of destinations using background tasks. Useful for exploring multiple cities at once.
*   **`accounts.py`**: Manages user profiles and preferences (currently mock implementation).

### 2.3 Engine Layer (`engine/`)
*   **`ai_core.py`**: Wrapper around Google GenAI SDK. Handles prompt injection, schema validation, and parallel image generation requests.
*   **`search_core.py`**: Wrapper around Perplexity API. Used for fetching real-time, grounded dat (e.g., flight prices, specific restaurant reviews) that requires web access.

### 2.4 Instructions (`instructions/`)
*   Contains the system prompts that define the AI personas.
*   **`schedule.py`**: Expert travel agent persona for day-by-day planning.
*   **`logistics.py`**: Logistics expert for transport options.
*   **`cuisine.py`**: Local food critic persona.

## 3. Example Workflows

### 3.1 Detailed Itinerary Generation
**Goal**: Create a 3-day trip to Kyoto.

1.  **Request**: `POST /api/v1/itinera/planner/itinerary` with `{destination: "Kyoto", days: 3}`.
2.  **Prompt Assembly**: System combines user request with `SYSTEM_PROMPT_ITINERARY`.
3.  **AI Generation**:
    *   Calls Gemini Flash model.
    *   Enforces `ItineraryResponse` JSON schema.
4.  **Parsing**: Response is parsed into Pydantic objects.
5.  **Image Generation (Parallel)**:
    *   System extracts `photo_prompts` from the AI response for every location.
    *   Spawns async tasks to generate images using Gemini Imagen model.
    *   Images are saved to `static/itineraries/kyoto/`.
6.  **Response**: Returns full JSON with `image_urls` pointing to the local static server.

### 3.2 Travel Logistics Search
**Goal**: Find how to get from Tokyo to Osaka.

1.  **Request**: `POST /api/v1/itinera/planner/options` with `{origin: "Tokyo", dest: "Osaka"}`.
2.  **Search**: Calls Perplexity API via `search_core`.
3.  **Context**: Uses `web_search_options` to find latest schedules and prices.
4.  **Fallback/Parsing**: Attempts to parse strict JSON. If LLM fails strict JSON, falls back to a minimal structure to ensure API stability.
5.  **Response**: Returns structured list of modes (Shinkansen, Bus, Flight) with approximate costs/times.

### 3.3 Batch Destination Processing (Background)
**Goal**: Compare trips to "London" and "Paris".

1.  **Request**: `POST /api/v1/itinera/places/process-destinations` with list of cities.
2.  **Ack**: Server generates a `task_id` and returns immediately (HTTP 202-like behavior).
3.  **Background Task**:
    *   Iterates through cities.
    *   For each city, runs 3 parallel AI calls: `Activities`, `Food`, `Accommodation`.
    *   Updates in-memory `tasks_storage`.
4.  **Polling**: Client polls `/api/v1/itinera/places/task-status/{task_id}`.
5.  **Completion**: Once status is `completed`, returns aggregated data for all cities.

## 4. Data Flow Diagram (Itinerary)

```mermaid
sequenceDiagram
    participant User
    participant API as API Endpoint
    participant AI as Gemini Engine
    participant FS as File System

    User->>API: POST /itinerary
    API->>AI: Generate content (Schema enforced)
    AI-->>API: JSON Itinerary Data
    
    loop For each Place
        API->>AI: Generate Image (Prompt)
        AI-->>API: Image Bytes
        API->>FS: Save .jpg
    end
    
## 5. Technical Deep Dive (Beginner's Guide)

### 5.1 How FastAPI Works
FastAPI is a modern Python web framework that handles the "plumbing" of receiving web requests and sending responses.

*   **Routing**: In `server.py` and `endpoints/`, we define functions decorated with things like `@router.get("/path")`. When a user visits that URL, FastAPI runs that specific function.
*   **Data Validation (Pydantic)**: We define classes in `types/models.py` that look like this:
    ```python
    class Destination(BaseModel):
        place: str
        days: int
    ```
    If a user sends data that doesn't match this shape (e.g., sends "three" instead of `3` for days), FastAPI automatically rejects it with a helpful error message. This keeps our code clean and safe.
*   **Async/Await**: You'll see `async def` and `await` everywhere. This allows the server to handle thousands of requests effectively. While Itinera is waiting for Google Gemini to reply (which might take 10 seconds), it can still process other incoming requests instead of freezing.

### 5.2 Understanding LLM Calls
The core of Itinera AI is "talking" to Large Language Models (LLMs) like Gemini. Here is the lifecycle of a request:

1.  **Prompt Engineering**: We don't just ask "Plan a trip". In `instructions/`, we have detailed "system prompts" that tell the AI: *"You are an expert travel planner. You must output JSON. You must consider budget..."*
2.  **Context Injection**: We take the user's input (e.g., "Kyoto, 3 days") and insert it into the prompt template.
3.  **Structured Output**: LLMs naturally speak English (or code). For a program to use the answer, we need strict data structures.
    *   We pass a **Schema** (from `types/models.py`) to Gemini.
    *   This forces the AI to reply *only* with valid JSON data that matches our exact requirements, avoiding the need for complex text parsing.
4.  **The Code Flow**:
    ```python
    # 1. Define what we want (Schema)
    response_schema = ItineraryResponse 
    
    # 2. Call the AI (engine/ai_core.py)
    data = await gemini.generate(prompt, schema=response_schema)
    
    # 3. Use the data as a normal Python object
    print(data.days[0].summary)
    ```

### 5.3 Background Tasks
Some things take too long for a normal web request (like generating 20 images).
*   **Fire and Forget**: We use FastAPI's `BackgroundTasks` to start these jobs. The user gets a "Success" message immediately, while the server continues working on the images in the background.

