import json

from pathlib import Path
from datetime import datetime
from datetime import timedelta

from pricing import (
    engie_total_price
)


PRICE_FILE = Path(
    "docs/prices.json"
)

OUTPUT_FILE = Path(
    "docs/dashboard.json"
)


def average_price(block):

    if not block:
        return None

    return (
        sum(
            p["total_price"]
            for p in block
        )
        /
        len(block)
    )


def cheapest_quarter(data):

    if not data:
        return None

    return min(
        data,
        key=lambda x:
        x["total_price"]
    )


def cheapest_hour(data):

    if not data:
        return None

    hourly = {}

    for item in data:

        hour = item["time"][:2]

        hourly.setdefault(
            hour,
            []
        ).append(
            item["total_price"]
        )

    best_hour = None
    best_price = None

    for hour, values in hourly.items():

        avg = (
            sum(values)
            /
            len(values)
        )

        if (
            best_price is None
            or
            avg < best_price
        ):

            best_price = avg
            best_hour = hour

    return {

        "hour":
        f"{best_hour}:00",

        "price":
        round(
            best_price,
            5
        )
    }


def add_hours(
    time_str,
    hours
):

    dt = datetime.strptime(
        time_str,
        "%H:%M"
    )

    end = (
        dt +
        timedelta(
            hours=hours
        )
    )

    return end.strftime(
        "%H:%M"
    )


def find_best_window(
    data,
    quarter_count
):

    if (
        not data
        or
        len(data)
        < quarter_count
    ):
        return None

    best_window = None
    best_average = None

    for i in range(
        len(data)
        -
        quarter_count
        +
        1
    ):

        window = (
            data[
                i:
                i + quarter_count
            ]
        )

        avg = (
            average_price(
                window
            )
        )

        if (
            best_average is None
            or
            avg < best_average
        ):

            best_average = avg
            best_window = window

    duration_hours = (
        quarter_count / 4
    )

    return {

        "from":
        best_window[0]["time"],

        "to":
        add_hours(
            best_window[0]["time"],
            duration_hours
        ),

        "average":
        round(
            best_average,
            5
        )
    }


def transform_prices(data):

    result = []

    for item in data:

        utc_time = datetime.fromisoformat(
            item["timestamp"]
            .replace("Z", "+00:00")
        )

        local_time = (
            utc_time +
            timedelta(hours=1)
        )

        result.append({

            "time":
            local_time.strftime(
                "%H:%M"
            ),

            "spot_price":
            round(
                item["price_eur_kwh"],
                5
            ),

            "total_price":
            engie_total_price(
                item["price_eur_kwh"]
            )

        })

    return result


with open(
    PRICE_FILE,
    encoding="utf-8"
) as f:

    prices = json.load(f)


today_data = (
    prices
    .get("today", {})
    .get("data", [])
)

tomorrow_section = (
    prices.get("tomorrow")
)

if (
    tomorrow_section
    and
    isinstance(
        tomorrow_section,
        dict
    )
):

    tomorrow_data = (
        tomorrow_section
        .get("data", [])
    )

else:

    tomorrow_data = []


today = (
    transform_prices(
        today_data
    )
)

tomorrow = (
    transform_prices(
        tomorrow_data
    )
)

current_price = (
    engie_total_price(
        prices["current"]
        ["current"]
        ["price_eur_kwh"]
    )
)

dashboard = {

    "current_price":
    round(
        current_price,
        5
    ),

    "cheapest_quarter_today":
    cheapest_quarter(
        today
    ),

    "cheapest_hour_today":
    cheapest_hour(
        today
    ),

    "cheapest_hour_tomorrow":
    cheapest_hour(
        tomorrow
    ),

    "best_2h_window":
    find_best_window(
        today,
        8
    ),

    "best_4h_window":
    find_best_window(
        today,
        16
    ),

    "best_6h_window":
    find_best_window(
        today,
        24
    ),

    "today":
    today,

    "tomorrow":
    tomorrow
}

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        dashboard,
        f,
        indent=2,
        ensure_ascii=False
    )

print()
print(
    "dashboard.json aangemaakt"
)
print()