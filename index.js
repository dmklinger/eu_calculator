let collect_dates = () => {
    let periods = [];
    let undefinedEntry = "";
    let undefinedExit = "";
    d3.selectAll('.period-entry')
        .each(function() {
            d3.select(this)
                .style('background-color', null)
            .select('#period-entry-message')    
                .remove();
            let enter = d3.select(this)
                .select('.enter-input')
                .node()
                .value;
            let exit = d3.select(this)
                .select('.exit-input')
                .node()
                .value;
            if (!enter && !exit) return;
            if (enter) enter = new Date(enter);
            if (exit) exit = new Date(exit);
            period = [enter, exit];
            if (enter && exit && exit < enter) {
                d3.select(this)
                    .style('background-color', 'lightcoral')
                    .append('span')
                        .attr('id', 'period-entry-message')
                        .text('Entry date is after exit date');
                return;
            }
            if (!enter && exit) {
                if (undefinedExit) {
                    d3.select(this)
                        .style('background-color', 'lightcoral')
                        .append('span')
                            .attr('id', 'period-entry-message')
                            .text('You already have a period with no entry date');
                    return;
                }
                undefinedExit = exit;
            }
            if (!exit && enter) {
                if (undefinedEntry) {
                    d3.select(this)
                        .style('background-color', 'lightcoral')
                        .append('span')
                            .attr('id', 'period-entry-message')
                            .text('You already have a period with no exit date');
                    return;
                }
                undefinedEntry = enter;
            }
            for (let [start, end] of periods) {
                if (
                    (!start && enter <= end) 
                        || (!enter && start <= exit) 
                        || (!end && exit >= start)
                        || (!exit && end >= enter)
                        || (enter <= end && start <= exit)
                ) {
                    d3.select(this)
                        .style('background-color', 'lightcoral')
                        .append('span')
                            .attr('id', 'period-entry-message')
                            .text('This period overlaps a previous period');
                    return;
                }
            }
            periods.push(period);
        });
    periods.sort();
    d3.select('#results-list').remove();
    d3.select("results")
        .append("div")
            .attr('id', 'results-list');
        
}

d3.select("#add-period-button").on(
    'click', (event) => {
        d3.select('#periods-list')
            .append('div')
                .attr('class', 'period-entry')
                .call(d => d.append("span")
                    .text("Enter:")
                )
                .call(d => d.append("input")
                    .attr('class', 'enter-input')
                    .attr('type', "date")
                    .on('change', (event) => {
                        collect_dates();
                    })
                )
                .call(d => d.append("span")
                    .text("Exit:")
                )
                .call(d => d.append("input")
                    .attr('class', 'exit-input')
                    .attr('type', "date")
                    .on('change', (event) => {
                        collect_dates();
                    })
                )
                .call(d => d.append('button')
                    .attr('id', 'remove-button')
                    .text('Remove Period')
                    .on('click', (event) => {
                        d3.select(event.target.parentNode)
                            .remove();
                        collect_dates();
                    })
                );
    }
)
