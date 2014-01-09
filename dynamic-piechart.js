/*
 * Dynamic piechart
 *
 * A pie chart object that can have value/sectors (i.e., 'entries') dynamically
 * added and removed
 */

Raphael.fn.pieChart = function (entries, cx, cy, r, stroke) {
    "use strict";
    var me = this;
    var rad = Math.PI / 180;

    me.cx = cx || 350;
    me.cy = cy || 250;
    me.r = r || 200;
    me.stroke = stroke || "#fff";
    me.elements = me.set();

    me.entries = entries; // data points.  Each should have 'label' and 'value'

    // Return a point ( {x:<val>, y:<val>} ), a certain distance from the center at a certain angle
    // Units of distance are radii.  (i.e., 0 is the center and 1 is on the circumference)
    function get_point(distance_from_center, angle) {
        return {
            x: me.cx + me.r * distance_from_center * Math.cos(-angle * rad),
            y: me.cy + me.r * distance_from_center * Math.sin(-angle * rad)
        };
    };

    // Draw and return a sector
    function make_sector(startAngle, endAngle, params){

        var point1 = get_point(1, startAngle);
        var point2 = get_point(1, endAngle);

        var patharr = ["M", me.cx, me.cy, "L", point1.x, point1.y, "A", me.r, me.r, 0, +(endAngle - startAngle > 180), 0, point2.x, point2.y, "z"]
        return me.path( patharr ).attr(params);
    };

    // Draw and return a text element
    function make_text(string, where) {
        return me.text(
            where.x,
            where.y,
            string
        ).attr({
            fill: "#000",
            stroke: "none",
            "font-size": 20,
        });
    };

    // Draw the whole chart.  Return the set of elements
    me.draw = function() {

        // Widdershins edge (counter-clockwise)
        var angle = 0;

        var total_value = me.entries.reduce(function(x,y){ return {value: x.value + y.value} }).value;
        var start = 0;
        var duration = 500;

        // Initialize component elements
        me.elements.remove();

        me.entries.forEach(function(entry){

            // Deasil edge of sector (clockwise)
            var angleplus = 360 * entry.value / total_value;

            // Angle of a line drawn through the middle of the sector
            var sector_angle = angle + (angleplus / 2);

            // Colors (2 for a gradient)
            var color = Raphael.hsb(start, 0.50, 1);
            var bcolor = Raphael.hsb(start, 1, 1);

            var sector = make_sector( angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: me.stroke, "stroke-width": 3});
            var text = make_text( entry.label + "(" + entry.value + ")", get_point( 0.5, sector_angle));

            sector.mouseover(function () {
                sector.stop().animate({transform: "s1.1 1.1 " + me.cx + " " + me.cy}, duration, "elastic");

            }).mouseout(function () {
                sector.stop().animate({transform: ""}, duration, "elastic");

            });

            me.elements.push(sector);
            me.elements.push(text);

            angle += angleplus;
            start += 0.1;

            return me.elements;

        });
    };

    me.add = function(label, value) {
        if (label.length <= 0 || value.length <= 0) { return null };
        me.entries.push({label: label, value: parseInt(value)});
        me.draw();
        return me.entries;
    };

    me.remove = function() {
        if (me.entries.length < 3) { 
            log("Can't remove entry.  Chart must have at least two entries.");
            return null 
        };

        var entry = me.entries.pop();
        me.draw();
        return entry;
    };

    me.draw();

    return me;

};
