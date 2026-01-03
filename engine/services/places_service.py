from typing import Any
import os
import asyncio
from google.genai import types as genai_types
from engine.ai_core import async_gemini_generate_content, async_generate_image_files
from schemas.models import ItineraryPlacesRequest, ItineraryPlacesResponse
from instructions.attractions import SYSTEM_PROMPT_ITINERARY_PLACES
from lib.file_ops import static_dir, ensure_dir
from settings import MODELS, GEMINI_SETTINGS, IMAGE_GENERATION

class PlacesService:
    async def get_places(self, req: ItineraryPlacesRequest) -> ItineraryPlacesResponse:
        system_prompt = SYSTEM_PROMPT_ITINERARY_PLACES
        user_prompt = (
            f"Destination: {req.destination_city}\n"
            f"Interests: {', '.join(req.interests) if req.interests else 'general'}\n"
            f"Max places: {req.max_places}\n"
            "Return concise place cards as per schema."
        )

        contents = [
            genai_types.Content(
                role="user",
                parts=[genai_types.Part.from_text(text=user_prompt)],
            )
        ]

        response_schema = self._get_places_schema()
        default_response = {"destination_city": req.destination_city, "places": []}

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

        # Image Generation
        await self._generate_place_images(req.destination_city, data)

        return ItineraryPlacesResponse(**data)

    async def _generate_place_images(self, destination_city: str, data: Any):
        image_base_url = "/static"
        dest_slug = destination_city.lower().replace(" ", "-")
        output_dir = os.path.join(static_dir(), f"itineraries/{dest_slug}/places")
        ensure_dir(output_dir)

        image_tasks = []
        for place in data.get("places", []):
            prompts = place.get("photo_prompts", [])[:IMAGE_GENERATION["max_images_per_entity"]]
            if prompts:
                base_file_name = place.get("place_name", "place").lower().replace(" ", "-")
                task = async_generate_image_files(
                    prompts=prompts,
                    output_dir=output_dir,
                    base_file_name=base_file_name,
                )
                image_tasks.append((place, task))

        # Parallel Execution (assuming less strict rate limit for places or keep consistent with itinerary)
        # Using parallel here but if ratelimit is global we might need throttle. 
        # For safety, let's just use gather but keep logic similar to original file for now.
        if image_tasks:
            results = await asyncio.gather(*[task for _, task in image_tasks], return_exceptions=True)
            
            for i, (place, _) in enumerate(image_tasks):
                result = results[i]
                if isinstance(result, Exception):
                    place["image_urls"] = []
                else:
                    files = result
                    place["image_urls"] = [
                        f"{image_base_url}/{os.path.relpath(fp, static_dir())}" for fp in files
                    ]
        else:
             for place in data.get("places", []):
                place["image_urls"] = []

    def _get_places_schema(self):
        return genai_types.Schema(
            type=genai_types.Type.OBJECT,
            required=["destination_city", "places"],
            properties={
                "destination_city": genai_types.Schema(type=genai_types.Type.STRING),
                "places": genai_types.Schema(
                    type=genai_types.Type.ARRAY,
                    items=genai_types.Schema(
                        type=genai_types.Type.OBJECT,
                        required=["city", "place_name", "speciality", "tips", "photo_prompts"],
                        properties={
                            "city": genai_types.Schema(type=genai_types.Type.STRING),
                            "place_name": genai_types.Schema(type=genai_types.Type.STRING),
                            "speciality": genai_types.Schema(type=genai_types.Type.STRING),
                            "tips": genai_types.Schema(
                                type=genai_types.Type.ARRAY,
                                items=genai_types.Schema(type=genai_types.Type.STRING),
                            ),
                            "photo_prompts": genai_types.Schema(
                                type=genai_types.Type.ARRAY,
                                items=genai_types.Schema(type=genai_types.Type.STRING),
                            ),
                        },
                    ),
                ),
            },
        )
