/*
 * Dynamic piechart
 *
 * A pie chart object that can have value/sectors dynamically added and removed
 */

Raphael.fn.pieChart = function (entries, cx, cy, r, stroke) {
    "use strict;"
    var me = this;
    me.cx = cx || 350;
    me.cy = cy || 350;
    me.r = r || 200;
    me.stroke = stroke || "#fff";
    me.chart = me.set();

    me.entries = entries; // data points.  Each should have 'label' and 'value'

    function draw_sector(startAngle, endAngle, params){

        var rad = Math.PI / 180;
        var x1 = me.cx + me.r * Math.cos(-startAngle * rad);
        var x2 = me.cx + me.r * Math.cos(-endAngle * rad);
        var y1 = me.cy + me.r * Math.sin(-startAngle * rad);
        var y2 = me.cy + me.r * Math.sin(-endAngle * rad);

        var patharr = ["M", me.cx, me.cy, "L", x1, y1, "A", me.r, me.r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]
        return me.path( patharr ).attr(params);
    };

    function draw() {
        var angle = 0;
        var total = me.entries.reduce(function(x,y){ return {value: x.value + y.value} }).value;
        var start = 0;

        me.entries.forEach(function(entry){
            var angleplus = 360 * entry.value / total;
            var color = Raphael.hsb(start, 0.75, 1);
            var delta = 30;
            var bcolor = Raphael.hsb(start, 1, 1);

            draw_sector( angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: me.stroke, "stroke-width": 3});

            angle += angleplus;
            start += 0.1;

        });
    };

    draw();

    return me;

};

Raphael.fn.demo_pieChart = function (cx, cy, r, values, labels, stroke) {

    var paper = this;
    var rad = Math.PI / 180;
    var chart = this.set();

    function make_sector(cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad);
        var x2 = cx + r * Math.cos(-endAngle * rad);
        var y1 = cy + r * Math.sin(-startAngle * rad);
        var y2 = cy + r * Math.sin(-endAngle * rad);

        var patharr = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]
        return paper.path(patharr).attr(params);
    }

    function draw(){

        var angle = 0;
        var total = 0;
        var start = 0;

            process = function (j) {
                var value = values[j];
                var angleplus = 360 * value / total;
                var popangle = angle + (angleplus / 2);
                var color = Raphael.hsb(start, .75, 1);
                var ms = 500;
                var delta = 30;
                var bcolor = Raphael.hsb(start, 1, 1);

                var p = make_sector(cx, cy, r, angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: stroke, "stroke-width": 3});
                var txt = paper.text(cx + (r + delta + 55) * Math.cos(-popangle * rad), cy + (r + delta + 25) * Math.sin(-popangle * rad), labels[j] + "(" + values[j] + ")").attr({fill: bcolor, stroke: "none", opacity: 0, "font-size": 20});

                p.mouseover(function () {
                    p.stop().animate({transform: "s1.1 1.1 " + cx + " " + cy}, ms, "elastic");
                    txt.stop().animate({opacity: 1}, ms, "elastic");

                }).mouseout(function () {
                    p.stop().animate({transform: ""}, ms, "elastic");
                    txt.stop().animate({opacity: 0}, ms);

                });

                angle += angleplus;
                chart.push(p);
                chart.push(txt);
                start += .1;
            };

        for (var i = 0, ii = values.length; i < ii; i++) {
            total += values[i];
        }

        for (i = 0; i < ii; i++) {
            process(i);
        }
    };

    this.add_sector = function(value, label){
        values.push(value);
        labels.push(label + " (" + value + ")");
        draw();
    };

    this.remove_sector = function(index){
        [values, labels].forEach(function(arr){
            arr.pop();
        });
        draw();
    };

    draw();
    return this;
};
