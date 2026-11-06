async function loadDashboard(){

    const response =
        await fetch(
            "dashboard.json"
        );

    const data =
        await response.json();

    document
    .querySelectorAll(".tab")
    .forEach(btn => {

        btn.onclick = () => {

            document
            .querySelectorAll(".tab")
            .forEach(
                t =>
                t.classList.remove(
                    "active"
                )
            );

            document
            .querySelectorAll(".page")
            .forEach(
                p =>
                p.classList.remove(
                    "active"
                )
            );

            btn.classList.add(
                "active"
            );

            document
            .getElementById(
                btn.dataset.tab
            )
            .classList.add(
                "active"
            );
        };
    });

    document.getElementById(
        "dashboard-content"
    ).innerHTML = `

<div class="card">
<div>⚡ Actuele prijs</div>
<div class="big">
€${data.current_price.toFixed(3)}
</div>
</div>

<div class="card">
<div>🥇 Goedkoopste kwartier</div>
<div class="big">
${data.cheapest_quarter_today.time}
</div>
<div>
€${data.cheapest_quarter_today.total_price.toFixed(3)}
</div>
</div>

<div class="card">
<div>🥇 Goedkoopste uur</div>
<div class="big">
${data.cheapest_hour_today.hour}
</div>
<div>
€${data.cheapest_hour_today.price.toFixed(3)}
</div>
</div>

<div class="card">
<div>🚗 Beste 2 uur</div>
<div class="big">
${data.best_2h_window.from}
→
${data.best_2h_window.to}
</div>
<div>
€${data.best_2h_window.average.toFixed(3)}
</div>
</div>

<div class="card">
<div>🚗 Beste 4 uur</div>
<div class="big">
${data.best_4h_window.from}
→
${data.best_4h_window.to}
</div>
<div>
€${data.best_4h_window.average.toFixed(3)}
</div>
</div>

<div class="card">
<div>🚗 Beste 6 uur</div>
<div class="big">
${data.best_6h_window.from}
→
${data.best_6h_window.to}
</div>
<div>
€${data.best_6h_window.average.toFixed(3)}
</div>
</div>

<div class="card">

<div>📅 Morgen</div>

<div class="big">

${
    data.cheapest_hour_tomorrow
    ?
    data.cheapest_hour_tomorrow.hour
    :
    "Nog niet beschikbaar"
}

</div>

</div>
`;

    const tbody =
        document.querySelector(
            "#today-table tbody"
        );

    tbody.innerHTML = "";

    data.today.forEach(
        row => {

            tbody.innerHTML += `
            <tr>
                <td>${row.time}</td>
                <td>€${row.spot_price.toFixed(3)}</td>
                <td>€${row.total_price.toFixed(3)}</td>
            </tr>
            `;
        }
    );

    if(
        !data.tomorrow ||
        data.tomorrow.length === 0
    ){

        document
        .getElementById(
            "tomorrow-content"
        )
        .innerHTML = `

        <div class="card">

        Morgenprijzen zijn
        nog niet beschikbaar.

        </div>
        `;
    }
    else{

        let html = `
        <table>

        <thead>

        <tr>
        <th>Tijd</th>
        <th>Spotprijs</th>
        <th>Werkelijke prijs</th>
        </tr>

        </thead>

        <tbody>
        `;

        data.tomorrow.forEach(
            row => {

                html += `
                <tr>
                    <td>${row.time}</td>
                    <td>€${row.spot_price.toFixed(3)}</td>
                    <td>€${row.total_price.toFixed(3)}</td>
                </tr>
                `;
            }
        );

        html += `
        </tbody>
        </table>
        `;

        document
        .getElementById(
            "tomorrow-content"
        )
        .innerHTML = html;
    }

    new Chart(

        document.getElementById(
            "priceChart"
        ),

        {

            type:"line",

            data:{

                labels:
                data.today.map(
                    x => x.time
                ),

                datasets:[
                {
                    label:
                    "Werkelijke prijs €/kWh",

                    data:
                    data.today.map(
                        x =>
                        x.total_price
                    ),

                    borderWidth:2
                }]
            }
        }
    );
}

loadDashboard();