# Itinera AI

**Advanced AI-Driven Itinerary Generation Engine**

Itinera AI is a high-performance backend service designed to create personalized, detailed travel itineraries using state-of-the-art Generative AI models. It processes complex travel constraints and user preferences to deliver optimized travel plans.

## Key Capabilities

*   **Intelligent Planning**: Generates day-by-day itineraries with logic-aware scheduling.
*   **Multi-Modal Options**: Analyzes optimal travel routes (flight, train, bus, car).
*   **Deep Local Insights**: Provides curated food and attraction recommendations.
*   **Visual Richness**: Generates relevant imagery for recommended locations.
*   **Scalable Architecture**: Built on FastAPI with asynchronous background processing for high throughput.

## Getting Started

### Prerequisites

*   Python 3.10+
*   Environment variables for AI providers (Google GenAI, Perplexity)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Configure environment:
    ```bash
    export GEMINI_API_KEY="your_key"
    export PERPLEXITY_API_KEY="your_key"
    ```

4.  Start the engine:
    ```bash
    python server.py
    ```
    The API will be available at `http://localhost:8000`.

## API Docs

Documentation is available at `/docs` when the server is running.

### Core Endpoints

*   **POST** `/api/v1/itinera/planner/itinerary` - Generate full itinerary.
*   **POST** `/api/v1/itinera/planner/options` - Get travel logistics.
*   **POST** `/api/v1/itinera/places/process-destinations` - Batch process destinations (background).
*   **GET** `/api/v1/itinera/system/` - System health check.

## Architecture

Itinera AI uses a modular architecture:
*   `engine/`: Core AI and search interfaces.
*   `endpoints/`: API route handlers categorized by domain.
*   `instructions/`: System prompts and AI guidance templates.
*   `types/`: Data models and schemas.

## License

Proprietary software. All rights reserved.
