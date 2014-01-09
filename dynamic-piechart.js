/*
 * Dynamic piechart
 *
 * A pie chart object that can have value/sectors dynamically added and removed
 */

Raphael.fn.pieChart = function (entries, cx, cy, r, stroke) {
    "use strict";
    var me = this;
    var rad = Math.PI / 180;

    me.cx = cx || 350;
    me.cy = cy || 250;
    me.r = r || 200;
    me.stroke = stroke || "#fff";

    me.entries = entries; // data points.  Each should have 'label' and 'value'

    function draw_sector(startAngle, endAngle, params){

        var x1 = me.cx + me.r * Math.cos(-startAngle * rad);
        var x2 = me.cx + me.r * Math.cos(-endAngle * rad);
        var y1 = me.cy + me.r * Math.sin(-startAngle * rad);
        var y2 = me.cy + me.r * Math.sin(-endAngle * rad);

        var patharr = ["M", me.cx, me.cy, "L", x1, y1, "A", me.r, me.r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]
        return me.path( patharr ).attr(params);
    };

    me.draw = function() {

        var angle = 0;
        var total = me.entries.reduce(function(x,y){ return {value: x.value + y.value} }).value;
        var start = 0;
        var duration = 500;

        // Initialize component elements
        me.elements = me.set();
        me.elements.remove();

        me.entries.forEach(function(entry){

            var angleplus = 360 * entry.value / total;
            var popangle = angle + (angleplus / 2);
            var color = Raphael.hsb(start, 0.75, 1);
            var delta = 30;
            var bcolor = Raphael.hsb(start, 1, 1);

            var p = draw_sector( angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: me.stroke, "stroke-width": 3});
            var txt = me.text(me.cx + (me.r + delta + 55) * Math.cos(-popangle * rad), me.cy + (me.r + delta + 25) * Math.sin(-popangle * rad), entry.label + "(" + entry.value + ")")
                    .attr({fill: bcolor, stroke: "none", opacity: 0, "font-size": 20});

            p.mouseover(function () {
                p.stop().animate({transform: "s1.1 1.1 " + me.cx + " " + me.cy}, duration, "elastic");
                txt.stop().animate({opacity: 1}, duration, "elastic");

            }).mouseout(function () {
                p.stop().animate({transform: ""}, duration, "elastic");
                txt.stop().animate({opacity: 0}, duration);

            });

            me.elements.push(p);
            me.elements.push(txt);

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
            console.log("Can't remove entry.  Chart must have at least two entries.");
            return null 
        };

        var entry = me.entries.pop();
        me.draw();
        return entry;
    };

    me.draw();

    return me;

};
