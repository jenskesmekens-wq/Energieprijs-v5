import json
import requests

from pathlib import Path


PRICE_URL = (
    "https://jenskesmekens-wq.github.io/"
    "Energieprijs-v4/prices.json"
)

OUTPUT_FILE = Path(
    "docs/prices.json"
)


def main():

    print()
    print(
        "Prijzen ophalen..."
    )
    print()

    response = requests.get(
        PRICE_URL,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            data,
            f,
            indent=2,
            ensure_ascii=False
        )

    print(
        f"Opgeslagen: "
        f"{OUTPUT_FILE}"
    )

    print()

    print(
        f"Updated_at: "
        f"{data.get('updated_at')}"
    )

    print()


if __name__ == "__main__":

    main()
