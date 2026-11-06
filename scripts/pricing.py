"""
pricing.py

Centrale prijsmotor voor Energieprijs‑V5.

Alle prijzen in €/kWh.
"""


def engie_total_price(
    spot_price_eur_kwh
):
    """
    Volledige afnameprijs voor
    Engie Dynamic + Fluvius
    Midden‑Vlaanderen.

    Input:
        spot_price_eur_kwh

    Output:
        totale afnameprijs €/kWh
    """

    spot_mwh = (
        spot_price_eur_kwh * 1000
    )

    #
    # Contractformule
    #
    b = 0.7134

    m = 0.1039

    #
    # BTW
    #
    vat = 1.06

    #
    # Fluvius Midden‑Vlaanderen
    #
    net = 5.27945

    #
    # Federale accijns
    #
    exc = 4.876

    energy_cents = (
        b +
        (m * spot_mwh)
    )

    energy_cents *= vat

    total_cents = (
        energy_cents +
        net +
        exc
    )

    return round(
        total_cents / 100,
        5
    )


def cheapest_item(
    quarter_prices
):

    if not quarter_prices:
        return None

    return min(
        quarter_prices,
        key=lambda x:
        x["total_price"]
    )


def average_window_price(
    window
):

    if not window:
        return None

    return (
        sum(
            p["total_price"]
            for p in window
        )
        /
        len(window)
    )


def find_best_window(
    quarter_prices,
    quarter_count
):

    if (
        not quarter_prices
        or
        len(quarter_prices)
        < quarter_count
    ):
        return None

    best_window = None

    best_average = None

    for i in range(
        len(quarter_prices)
        - quarter_count + 1
    ):

        window = (
            quarter_prices[
                i:i + quarter_count
            ]
        )

        avg = (
            average_window_price(
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

    return {

        "from":
        best_window[0]["time"],

        "to":
        best_window[-1]["time"],

        "average":
        round(
            best_average,
            5
        )
    }


def convert_quarter_prices(
    raw_data
):

    result = []

    for item in raw_data:

        result.append({

            "time":
            item["hour_label"],

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