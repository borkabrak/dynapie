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


  
  NOTES:
    * About angles: The zero angle is at 3 o'clock.  Positive angles are 
      counter-clockwise from there. (90 degrees is at 12 o'clock)

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

        var removed = {};

        // Remove by label name
        removed[what] = me.entries[what];
        delete me.entries[what];

        me.draw();
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
            ).click(function(event){
            });

            me.elements.push(sector);

            var text = make_text( 
                label + "(" + value + ")",
                get_point( 0.6, sector_angle)
            );
            if (too_small(angle, angle + angleplus, text)) {
                text.remove();
                small_sector(sector, label, value, sector_angle);

            } else {
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

    // Return the angle of a particular point (off the right horizontal, wrt the center)
    function get_angle(point){

        // From origin center of circle
        var x = point.x - me.cx;
        var y = me.cy - point.y;
        var angle = Math.atan2( y , x ) / rad;
        if (angle < 0) {
            angle = 360 + angle;
        };
        return angle;
    }


    // Draw and return a sector
    function make_sector(startAngle, endAngle, params){
        return me.path(Raphael.fullfill(

                "M{me.cx},{me.cy} L{point1.x},{point1.y} A{me.r},{me.r} 0 {largearcflag} 0 {point2.x},{point2.y} z",

                {
                    point1: get_point(1, startAngle),
                    point2: get_point(1, endAngle),
                    me: me,
                    largearcflag: +(endAngle - startAngle > 180)
                })

        ).attr(params);
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
            $("#remove_this, #label").val(
                event.target.textContent.replace(/(.*)\(.*/, "$1")
            );
            $("#value").val(
                event.target.textContent.replace(/.*\((.*)\)/,"$1")
            );
        });
    };

    function attach_events(sector, text){

        var duration = 250;

        // On hover, swell sector
        sector.mouseover(function () {
            sector.stop().animate({ transform: "s1.05 1.05 " + me.cx + "," + me.cy }, duration, "linear");
            if (text.type == "text") {
                text.stop().animate({ transform: "s1.05 1.05 " + me.cx + "," + me.cy }, duration, "linear");
            };

        }).mouseout(function () {
            sector.stop().animate({ transform: ""}, duration, "bounce");
            if (text.type == "text") {
                text && text.stop().animate({ transform: ""}, duration, "bounce");
            };

        });
    };

    // Alternate handling for when a sector is too narrow for its label.
    function small_sector(sector, label, value, middle_angle) {
        var start = get_point(1, middle_angle);
        var end = get_point(1.2, middle_angle);
       
        // Put the label outside the chart, and draw a line from the sector to the lable
        me.elements.push( 
            me.path(Raphael.fullfill(
                "M {start.x}, {start.y} L {end.x},{end.y} z",
                { start: start, end: end }

            )).attr({ color: "#333" }),

            make_text(label + "(" + value + ")", get_point(1.4, middle_angle))

        );
    };

    function too_small(angle1, angle2, text){
        // Return true if the given text does not fit between the given angles.
        //
        // If neither side of the sector crosses the text's bounding box, we're NOT too small!
        var box = text.getBBox();
        var corner_angles = [
            get_angle({ x: box.x,  y: box.y}),
            get_angle({ x: box.x2, y: box.y}),
            get_angle({ x: box.x,  y: box.y2}),
            get_angle({ x: box.x2, y: box.y2})
        ];

        var min = function(array){ return array.reduce(function(x,y){ return (x < y)? x : y })};
        var max = function(array){ return array.reduce(function(x,y){ return (x > y)? x : y })};

        return (angle1 > min(corner_angles) || angle2 < max(corner_angles)); 
        
    };

};

Object.values = function(object){
    var result = [];
    for (var key in object)
        result.push(object[key]);
    return result;
};
