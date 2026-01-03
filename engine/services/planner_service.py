from typing import Any, List, Optional
import os
import asyncio
from google.genai import types as genai_types
from engine.ai_core import async_gemini_generate_content, async_generate_image_files
from schemas.models import ItineraryRequest
from instructions.schedule import SYSTEM_PROMPT_ITINERARY
from lib.file_ops import static_dir, ensure_dir
from settings import MODELS, GEMINI_SETTINGS, IMAGE_GENERATION

class PlannerService:
    async def generate_itinerary(self, payload: ItineraryRequest) -> Any:
        print(f"SERVER_LOG: Received itinerary request for {payload.destination_city} from {payload.home_city}")
        
        system_prompt = SYSTEM_PROMPT_ITINERARY
        user_prompt = (
            f"Home: {payload.home_city}\n"
            f"Destination: {payload.destination_city}\n"
            f"Days: {payload.num_days}\n"
            f"Interests: {', '.join(payload.interests) if payload.interests else 'general'}\n"
            "Generate an end-to-end itinerary as per schema."
        )

        contents = [
            genai_types.Content(
                role="user",
                parts=[genai_types.Part.from_text(text=user_prompt)],
            )
        ]

        # Structured schema for itinerary (reused from original)
        response_schema = self._get_itinerary_schema()
        
        default_response = {
            "home_city": payload.home_city,
            "destination_city": payload.destination_city,
            "num_days": payload.num_days,
            "days": [],
            "overall_tips": [],
        }

        print("SERVER_LOG: Calling Gemini API for itinerary generation...")
        
        data = await async_gemini_generate_content(
            model=MODELS["gemini"]["text"],
            contents=contents,
            system_prompt=system_prompt,
            response_schema=response_schema,
            temperature=GEMINI_SETTINGS["temperature"]["text"],
            top_p=GEMINI_SETTINGS["top_p"]["text"],
            max_output_tokens=GEMINI_SETTINGS["max_output_tokens"]["text"],
            timeout=GEMINI_SETTINGS["timeout"]["text"],
            default_response=default_response,
        )
        print("SERVER_LOG: Gemini response received. Processing data...")

        # Image Generation Logic
        await self._generate_images(payload.destination_city, data)
        
        return data

    async def _generate_images(self, destination_city: str, data: Any):
        image_base_url = "/static"
        dest_slug = destination_city.lower().replace(" ", "-")
        output_dir = os.path.join(static_dir(), f"itineraries/{dest_slug}")
        ensure_dir(output_dir)

        image_tasks = []
        for day in data.get("days", []):
            for entity in day.get("entities", []):
                prompts = entity.get("photo_prompts", [])[:IMAGE_GENERATION["max_images_per_entity"]]
                if prompts:
                    base_file_name = entity.get("name", "entity").lower().replace(" ", "-")
                    # We create the coroutine but don't schedule it yet
                    task = async_generate_image_files(
                        prompts=prompts,
                        output_dir=output_dir,
                        base_file_name=base_file_name,
                    )
                    image_tasks.append((entity, task))

        # Throttling Logic
        MAX_TOTAL_IMAGES = 3
        image_tasks = image_tasks[:MAX_TOTAL_IMAGES]
        
        print(f"SERVER_LOG: Processing {len(image_tasks)} image tasks sequentially (throttled)...")

        for i, (entity, task) in enumerate(image_tasks):
            try:
                if i > 0:
                    print("SERVER_LOG: Waiting 5s before next image generation...")
                    await asyncio.sleep(5)
                
                print(f"SERVER_LOG: Generating image for {entity.get('name', 'entity')}...")
                files = await task
                
                if files:
                    entity["image_urls"] = [
                         f"{image_base_url}/{os.path.relpath(fp, static_dir())}" for fp in files
                    ]
                    print(f"SERVER_LOG: Image generated for {entity.get('name')}")
                else:
                     entity["image_urls"] = []
            except Exception as e:
                print(f"SERVER_LOG: Failed to generate image for {entity.get('name')}: {e}")
                entity["image_urls"] = []
        
        # Ensure entities without images have empty list
        self._ensure_empty_images(data)

    def _ensure_empty_images(self, data: Any):
        for day in data.get("days", []):
            for entity in day.get("entities", []):
                if "image_urls" not in entity:
                    entity["image_urls"] = []

    def _get_itinerary_schema(self):
        return genai_types.Schema(
            type=genai_types.Type.OBJECT,
            required=["home_city", "destination_city", "num_days", "days"],
            properties={
                "home_city": genai_types.Schema(type=genai_types.Type.STRING),
                "destination_city": genai_types.Schema(type=genai_types.Type.STRING),
                "num_days": genai_types.Schema(type=genai_types.Type.INTEGER),
                "days": genai_types.Schema(
                    type=genai_types.Type.ARRAY,
                    items=genai_types.Schema(
                        type=genai_types.Type.OBJECT,
                        required=["day", "summary", "entities"],
                        properties={
                            "day": genai_types.Schema(type=genai_types.Type.INTEGER),
                            "summary": genai_types.Schema(type=genai_types.Type.STRING),
                            "route_info": genai_types.Schema(type=genai_types.Type.STRING),
                            "entities": genai_types.Schema(
                                type=genai_types.Type.ARRAY,
                                items=genai_types.Schema(
                                    type=genai_types.Type.OBJECT,
                                    required=["name", "speciality", "places_to_visit", "photo_prompts"],
                                    properties={
                                        "name": genai_types.Schema(type=genai_types.Type.STRING),
                                        "speciality": genai_types.Schema(type=genai_types.Type.STRING),
                                        "places_to_visit": genai_types.Schema(
                                            type=genai_types.Type.ARRAY,
                                            items=genai_types.Schema(
                                                type=genai_types.Type.OBJECT,
                                                required=["name", "description"],
                                                properties={
                                                    "name": genai_types.Schema(type=genai_types.Type.STRING),
                                                    "description": genai_types.Schema(type=genai_types.Type.STRING),
                                                },
                                            ),
                                        ),
                                        "photo_prompts": genai_types.Schema(
                                            type=genai_types.Type.ARRAY,
                                            items=genai_types.Schema(type=genai_types.Type.STRING),
                                        ),
                                    },
                                ),
                            ),
                        },
                    ),
                ),
                "overall_tips": genai_types.Schema(
                    type=genai_types.Type.ARRAY,
                    items=genai_types.Schema(type=genai_types.Type.STRING),
                ),
            },
        )
