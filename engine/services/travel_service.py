from typing import Any
from schemas.models import TravelOptionsRequest, TravelOptionsResponse
from engine.search_core import PerplexityService
from instructions.logistics import SYSTEM_PROMPT_TRAVEL_OPTIONS
from settings import MODELS, PERPLEXITY_SETTINGS
import json

class TravelService:
    async def get_travel_options(self, payload: TravelOptionsRequest) -> TravelOptionsResponse:
        user_prompt = (
            f"Origin: {payload.origin_city}\n"
            f"Destination: {payload.destination_city}\n"
            "List practical travel options by mode as per schema."
        )

        svc = PerplexityService()
        result = await svc.chat_completion(
            system_prompt=SYSTEM_PROMPT_TRAVEL_OPTIONS,
            user_prompt=user_prompt,
            model=MODELS["perplexity"]["text"],
            temperature=PERPLEXITY_SETTINGS["temperature"],
            top_p=PERPLEXITY_SETTINGS["top_p"],
            max_tokens=PERPLEXITY_SETTINGS["max_tokens"],
            web_search_options=PERPLEXITY_SETTINGS["web_search_options"],
            recency_filter=payload.recency_filter,
        )

        # Extract assistant message content
        choices = result.get("choices", [])
        text = ""
        if choices:
            msg = choices[0].get("message", {})
            text = msg.get("content", "")

        # Safe JSON parsing
        data = self._parse_json(text)

        if data is None:
            # Fallback
            data = {
                "origin": payload.origin_city,
                "destination": payload.destination_city,
                "travel_options": {
                    "train": [], "bus": [], "car_taxi": [], "car_transport": [], 
                    "part_load_transport": [], "flight": []
                }
            }

        # Normalize data (ensure top-level fields)
        data.setdefault("origin", payload.origin_city)
        data.setdefault("destination", payload.destination_city)
        
        # Convert weird "travel_options" dict schema to "modes" list schema if needed
        if "travel_options" in data:
            modes_list = []
            travel_opts = data.get("travel_options", {})
            for mode_name, options in travel_opts.items():
                if options:
                    modes_list.append({"mode": mode_name, "options": options})
            data["modes"] = modes_list
            del data["travel_options"]

        # Final field mapping
        data["origin_city"] = data.pop("origin", payload.origin_city)
        data["destination_city"] = data.pop("destination", payload.destination_city)

        return TravelOptionsResponse(**data)

    def _parse_json(self, text: str) -> Any:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try finding { } block
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                try:
                    return json.loads(text[start_idx:end_idx])
                except:
                    pass
        return None
