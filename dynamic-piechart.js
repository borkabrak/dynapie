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

    function make_sector(startAngle, endAngle, params){

        var point1 = {
            x: me.cx + me.r * Math.cos(-startAngle * rad),
            y: me.cy + me.r * Math.sin(-startAngle * rad)
        };

        var point2 = {
            x: me.cx + me.r * Math.cos(-endAngle * rad),
            y: me.cy + me.r * Math.sin(-endAngle * rad)
        };

        var patharr = ["M", me.cx, me.cy, "L", point1.x, point1.y, "A", me.r, me.r, 0, +(endAngle - startAngle > 180), 0, point2.x, point2.y, "z"]
        return me.path( patharr ).attr(params);
    };

    function make_text(entry, popangle) {
        return me.text(
                me.cx + (me.r / 2) * Math.cos(-popangle * rad),
                me.cy + (me.r / 2) * Math.sin(-popangle * rad),
                entry.label + "(" + entry.value + ")"
            ).attr({
                fill: "#000",
                stroke: "none",
                "font-size": 20
            });
    };

    me.draw = function() {

        var angle = 0;
        var total = me.entries.reduce(function(x,y){ return {value: x.value + y.value} }).value;
        var start = 0;
        var duration = 500;

        // Initialize component elements
        me.elements.remove();

        me.entries.forEach(function(entry){

            var angleplus = 360 * entry.value / total;
            var popangle = angle + (angleplus / 2);
            var color = Raphael.hsb(start, 0.75, 1);
            var bcolor = Raphael.hsb(start, 1, 1);

            var sector = make_sector( angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: me.stroke, "stroke-width": 3});
            var text = make_text(entry, popangle);

            sector.mouseover(function () {
                sector.stop().animate({transform: "s1.1 1.1 " + me.cx + " " + me.cy}, duration, "elastic");

            }).mouseout(function () {
                sector.stop().animate({transform: ""}, duration, "elastic");

            });

            me.elements.push(sector);
            me.elements.push(text);

            angle += angleplus;
            start += 0.1;

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
