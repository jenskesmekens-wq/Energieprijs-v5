function buildRankingClasses(prices){

    const sorted =
        [...prices]
        .sort(
            (a,b) =>
            a.total_price -
            b.total_price
        );

    const map = {};

    sorted.forEach(
        (row,index) => {

            const pct =
                (
                    index /
                    sorted.length
                ) * 100;

            const key =
                row.time +
                "_" +
                row.total_price;

            if(pct <= 20){

                map[key] =
                    "good";
            }
            else if(
                pct <= 70
            ){

                map[key] =
                    "warning";
            }
            else{

                map[key] =
                    "bad";
            }
        }
    );

    return map;
}

async function loadDashboard(){

    const response =
        await fetch(
            "dashboard.json"
        );

    const data =
        await response.json();

    const todayClasses =
        buildRankingClasses(
            data.today
        );

    const tomorrowClasses =
        buildRankingClasses(
            data.tomorrow || []
        );

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

<div>
📅 Beste 3 uur morgen
</div>

${
    data.best_3h_window_tomorrow
    ?
    `
    <div class="big">
    ${data.best_3h_window_tomorrow.from}
    →
    ${data.best_3h_window_tomorrow.to}
    </div>

    <div>
    €${data.best_3h_window_tomorrow.average.toFixed(3)}
    </div>
    `
    :
    `
    <div class="big">
    Nog niet beschikbaar
    </div>
    `
}

</div>
`;

    const tbody =
        document.querySelector(
            "#today-table tbody"
        );

    tbody.innerHTML = `
<tr>
<td colspan="3">
📅 ${data.today_date}
</td>
</tr>
`;

    data.today.forEach(
        row => {

            const key =
                row.time +
                "_" +
                row.total_price;

            tbody.innerHTML += `
<tr>
<td>${row.time}</td>

<td>
€${row.spot_price.toFixed(3)}
</td>

<td class="${
    todayClasses[key]
}">
€${row.total_price.toFixed(3)}
</td>
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

<h3>
📅 ${data.tomorrow_date}
</h3>

Prijzen voor morgen
zijn nog niet beschikbaar.

</div>
`;
    }
    else{

        let html = `

<h3>
📅 ${data.tomorrow_date}
</h3>

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

                const key =
                    row.time +
                    "_" +
                    row.total_price;

                html += `
<tr>
<td>${row.time}</td>

<td>
€${row.spot_price.toFixed(3)}
</td>

<td class="${
    tomorrowClasses[key]
}">
€${row.total_price.toFixed(3)}
</td>

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

    const chart =
        document.getElementById(
            "priceChart"
        );

    new Chart(
        chart,
        {
            type:"line",

            data:{

                labels:
                data.today.map(
                    x => x.time
                ),

                datasets:[{

                    label:
                    "Werkelijke prijs €/kWh",

                    data:
                    data.today.map(
                        x =>
                        x.total_price
                    ),

                    borderWidth:3,

                    tension:0.3
                }]
            },

            options:{

                responsive:true,

                maintainAspectRatio:false
            }
        }
    );
}

loadDashboard();