let periods = []

d3.select("#add-period-button").on(
    'click', (event) => {
        d3.select('#periods-list')
            .append('div')
                .attr('class', 'period-entry')
                .call(d => d.append("span")
                    .text("Enter:")
                )
                .call(d => d.append("input")
                    .attr("type", "date")
                )
                .call(d => d.append("span")
                    .text("Exit:")
                )
                .call(d => d.append("input")
                    .attr("type", "date")
                )
    }
)
