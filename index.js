const months = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec",
}

let formatDate = (date) => {
    return months[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear();
}

let collectDates = () => {
    d3.select('#results-list').remove();
    const periods = [];
    let undefinedEntry = "";
    let undefinedExit = "";
    let hasIssue = false;
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
                hasIssue = true;
                return;
            }
            if (!enter && exit) {
                if (undefinedExit) {
                    d3.select(this)
                        .style('background-color', 'lightcoral')
                        .append('span')
                            .attr('id', 'period-entry-message')
                            .text('You already have a period with no entry date');
                    hasIssue = true;
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
                    hasIssue = true;
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
                    hasIssue = true;
                    return;
                }
            }
            periods.push(period);
        });
    if (hasIssue) {
        d3.select("#results")
            .append("div")
                .attr('id', 'results-list')
            .append('div')
                .attr('id', 'results-entry')
                .text("Please fix the issues on the periods first.")
    }
    periods.sort();
    const oneDay = 24 * 60 * 60 * 1000;
    const windowSize = 180;
    const dayLimit = 90;
    const messages = []
    for (const [start, end] of periods) {
        if (start && end) {
            const entryWindow = new Date();
            entryWindow.setTime(start.getTime() - (windowSize * oneDay));
            let days = 0;
            for (const [prevStart, prevEnd] of periods) {
                if (
                    prevStart 
                        && prevStart !== start
                        && prevEnd 
                        && prevEnd !== end
                        && prevStart < start 
                        && entryWindow < prevEnd
                ) {
                    let adjustedStart = Math.max(prevStart, entryWindow);
                    days += (prevEnd - adjustedStart) / oneDay + 1;
                }
            }
            if (days < dayLimit) {
                let remainingDays = dayLimit - days;
                let plural = "";
                if (remainingDays !== 1) { plural = "s"; }
                let lastDay = new Date();
                lastDay.setTime(start.getTime() + (remainingDays - 1) * oneDay);
                let firstDay = new Date();
                firstDay.setTime(end.getTime() - (remainingDays - 1) * oneDay);
                if (end > lastDay) {
                    messages.push(`The period from ${formatDate(start)} to ${formatDate(end)} is too long. On ${formatDate(start)} you will have ${remainingDays} day${plural} of eligibility. Thus, you must either enter on or after ${formatDate(firstDay)} or exit on or before ${formatDate(lastDay)}.`)
                }
            }
        }
    }
    if (undefinedEntry) {
        const entryWindow = new Date();
        entryWindow.setTime(undefinedEntry.getTime() - (windowSize * oneDay));
        let days = 0;
        for (const [prevStart, prevEnd] of periods) {
            if (
                prevStart 
                    && prevEnd
                    && prevStart !== undefinedEntry
                    && prevEnd > entryWindow
            ) {
                let adjustedStart = Math.max(prevStart, entryWindow);
                days += (prevEnd - adjustedStart) / oneDay + 1;
            }
        }
        let message = "";
        if (days < dayLimit) {
            let remainingDays = dayLimit - days;
            let lastDay = new Date();
            lastDay.setTime(undefinedEntry.getTime() + (remainingDays - 1) * oneDay);
            message = `You can enter at ${formatDate(undefinedEntry)} and leave on or before ${formatDate(lastDay)} without running out of elibility.`;
        } else {
            message = `You will not have enough eligibility to have a period that starts on ${formatDate(undefinedEntry)}`;
        }
        messages.push(message);
    }
    if (undefinedExit) {
        const exitWindow = new Date();
        exitWindow.setTime(undefinedExit.getTime() + (windowSize * oneDay));
        let days = 0;
        for (const [nextStart, nextEnd] of periods) {
            if (
                nextStart 
                    && nextEnd 
                    && nextEnd !== undefinedExit
                    && nextStart < exitWindow
            ) {
                let adjustedEnd = Math.min(nextEnd, exitWindow);
                days += (adjustedEnd - nextStart) / oneDay + 1;
            }
        }
        let message = "";
        if (days < dayLimit) {
            let remainingDays = dayLimit - days;
            let firstDay = new Date();
            firstDay.setTime(undefinedExit.getTime() - (remainingDays - 1) * oneDay);
            message = `You can enter at any day on or after ${formatDate(firstDay)} and exit ${formatDate(undefinedExit)} without running out of elibility.`;
        } else {
            message = `You will not have enough eligibility to have a period that ends on ${formatDate(undefinedExit)}`;
        }
        messages.splice(0, 0, message);
    }
    if (messages.length === 0) {
        messages.push("No problems!")
    }
    d3.select("#results")
        .append("div")
            .attr('id', 'results-list')
        .selectAll('div.results-entry')
        .data(messages)
        .join('div')
            .attr('class', 'results-entry')
            .text(d => d)
        
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
                        collectDates();
                    })
                )
                .call(d => d.append("span")
                    .text("Exit:")
                )
                .call(d => d.append("input")
                    .attr('class', 'exit-input')
                    .attr('type', "date")
                    .on('change', (event) => {
                        collectDates();
                    })
                )
                .call(d => d.append('button')
                    .attr('id', 'remove-button')
                    .text('Remove Period')
                    .on('click', (event) => {
                        d3.select(event.target.parentNode)
                            .remove();
                        collectDates();
                    })
                );
    }
)
