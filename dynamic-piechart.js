/*
  Dynamic piechart
 
  A pie chart object that can have value/sectors (i.e., 'entries') dynamically
  added and removed
 
  Usage:
   pieChart(entries, params)
 
       - entries:
           An object describing sectors in the pie chart. e.g.:
 
               var entries = {
                    "javascript": 33,
                    "css": 19,
                    . . .
                }
            
       - params:
           Contains non-default details of the pie chart as a whole:
 
               cx, cy: Where on the canvas to put the center of the chart
 
               r: Radius of the chart
 
               stroke: Stroke color of the lines
 */

Raphael.fn.pieChart = function (entries, params) {
    "use strict";
    var me = this;
    var rad = Math.PI / 180; // Gnarly!

    params = params || {};
    me.cx = params.cx || 350;
    me.cy = params.cy || 250;
    me.r = params.r || 200;
    me.stroke = params.stroke || "#fff";
    me.elements = me.set();

    me.entries = entries; 

    me.add_sector = function(label, value) {
        if (label.length <= 0 || value.length <= 0) { return null };
        me.entries[label] = parseInt(value);
        me.draw();
        return me.entries;
    };

    me.remove_sector = function(what) {
        if (Object.keys(me.entries).length < 3) { 
            log("Can't remove entry.  Chart must have at least two entries.");
            return null 
        };

        // Remove by label name
        var removed = {};

        removed[what] = me.entries[what];
        delete me.entries[what];

        me.draw();
        console.log("Removed:%o",removed);
        return removed;
    };

    // Draw the whole chart.  Return the set of elements
    me.draw = function() {

        
        var angle = 0; // Widdershins edge of a sector (counter-clockwise)
        var total_value = Object.values(me.entries).reduce(function(x,y){ return x + y });
        var start = 0;

        // Initialize component elements
        me.elements.remove();

        Object.keys(me.entries).forEach(function(label){
            var value = entries[label];

            var angleplus = 360 * value / total_value; // Deasil edge of sector (clockwise)

            var sector_angle = angle + (angleplus / 2); // Angle of a line drawn through the middle of the sector

            // Colors (2 for a gradient)
            var color = Raphael.hsb(start, 0.50, 1);
            var bcolor = Raphael.hsb(start, 1, 1);

            var sector = make_sector( 
                angle,
                angle + angleplus,
                {
                    fill: "90-" + bcolor + "-" + color,
                    stroke: me.stroke, 
                    "stroke-width": 3,
                    title: angleplus > 30 ? "" : label + "(" + value + ")"
                }
            ).attr(
                "title", label + "(" + value + ")"
            );

            me.elements.push(sector);

            // Sector too small?  Show a tooltip instead.
            //  For now, the test is just whether the sector is < 30°.
            if (angleplus < 30) {

                small_sector(sector, label, value, sector_angle);

            } else {
                var text = make_text( 
                    label + "(" + value + ")",
                    get_point( 0.6, sector_angle)
                );
                me.elements.push(text);
            };

            attach_events(sector, text);

            angle += angleplus;
            start += 0.1;

            return me.elements;

        });
    };

    me.draw();
    return me;


    // PRIVATE FUNCTIONS
    //====================

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
        }).click(function(event){
            console.log("Text clicked:%o", event);
            $("#remove_this").val(
                event.target.textContent.replace(/(.*)\(.*/, "$1")
            );
        });
    };

    function attach_events(sector, text){
        var duration = 250;

        var original_attributes = sector.attr();

        sector.mouseover(function () {
            sector.stop().animate({ transform: "s1.05 1.05 " + me.cx + "," + me.cy }, duration, "linear");
            text && text.stop().animate({ transform: "s1.05 1.05 " + me.cx + "," + me.cy }, duration, "linear");

        }).mouseout(function () {
            sector.stop().animate({ transform: ""}, duration, "bounce");
            text && text.stop().animate({ transform: ""}, duration, "bounce");

        });
    };

    // Alternate handling for when a sector is too narrow for its label.
    function small_sector(sector, label, value, middle_angle) {
        var start = get_point(1, middle_angle);
        var end = get_point(1.2, middle_angle);
        
        me.elements.push( 
            me.path(
                ["M", start.x, start.y, "L", end.x, end.y, "z"]
            ).attr({ 
                color: "#333"
            }),

            make_text(label + "(" + value + ")", get_point(1.4, middle_angle))

        );
    };

};

Object.values = function(object){
    var result = [];
    for (var key in object)
        result.push(object[key]);
    return result;
};
