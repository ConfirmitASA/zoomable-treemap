let hierarchyCSS = require('./treemap.css');

const d3 = require("d3"); //https://d3js.org/d3.v3.min.js;
const BrowserDetection = require('./helpers/detectBrowser');
const reverseEscapeEntities = require('./helpers/reverseEscapeEntities');

class ZoomableTreemap {
  constructor({
                flatHierarchy,
                tableContainerId,
                treemapContainerId,
                isDrilldownEnabled = false,
                colorFunction = function (value) {
                  if (+value > 0) {
                    return '#8AE274'; //green
                  } else {
                    if (+value < 0) {
                      return '#D4494F '; // red
                    }
                    else {
                      return '#FFEC42'; // yellow
                    }
                  }
                },
               containerWidth = 1060,
               containerHeight = 600
              }) {
    const treemapClass = this;

    const doc = document.documentElement;
    if (!BrowserDetection.detectIE() && !BrowserDetection.detectFirefox()) {
      doc.setAttribute('data-useragent', 'notie');
    }

    const hierarchy = this.flatToHierarchy(flatHierarchy);

    if(hierarchy.length > 1) {
      this.root = {name: 'Top', children: hierarchy};
    } else if(hierarchy.length === 1){
      this.root = {name: hierarchy[0].name, children: hierarchy[0].children};
    } else {
      return;
    }

    this.rows = document.querySelectorAll('#' + tableContainerId + ' tbody tr');
    this.setUpHierarchy(this.root);
    this.isDrilldownEnabled = isDrilldownEnabled;


    let margin = {top: 20, right: 0, bottom: 0, left: 0},
      width = containerWidth,
      height = containerHeight - margin.top - margin.bottom,
      formatNumber = d3.format(",d"),
      transitioning;

    const x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);

    const y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);

    const treemap = d3.layout.treemap()
      .children(function (d, depth) {
        return depth ? null : d._children;
      })
      .sort(function (a, b) {
        return a.value - b.value;
      })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);

    const svg = d3.select("#" + treemapContainerId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");

    const grandparent = svg.append("g")
      .attr("class", "grandparent");

    grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top);

    grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em");

    // Define the div for the tooltip
    const div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const arrow = d3.select('body').append("div")
      .attr("class", "arrow-up")
      .style("opacity", 0);


    initialize(this.root);
    accumulate(this.root);
    layout(this.root);
    display(this.root);


    function initialize(root) {
      root.x = root.y = 0;
      root.dx = width;
      root.dy = height;
      root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
      d._children = d.children;
      if (d._children) {
        d.value = d.children.reduce(function (p, v) {
          return p + accumulate(v);
        }, 0);
      }
      return d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d._children) {
        treemap.nodes({_children: d._children});
        d._children.forEach(function (c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;

          layout(c);
        });
      }
    }

    function display(d) {

      grandparent
        .datum(d.parent)
        .on("click", transition)
        .select("text")
        .text(name(d));

      const g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

      const g = g1.selectAll("g")
        .data(d._children)
        .enter().append("g");

      g.filter(function (d) {
        return d._children;
      })
        .classed("children", true)
        .on("click", transition);

      g.selectAll(".child")
        .data(function (d) {
          return d._children || [d];
        })
        .enter().append("rect")
        .attr("class", "child")
        .style("fill", function (d) {
          return this.parentNode.className.baseVal.indexOf('children') >= 0 ? colorFunction(d.parent.value) : colorFunction(d.value);
        })
        .call(rect);

      const parentSelection = g.append("rect")
        .attr("class", "parent")
        .call(rect)
        .style("fill", function (d) {
          return colorFunction(d.value);
        })
        .text(function (d) {
          return formatNumber(d.value);
        });

      const texts = g.append("text")
        .text(function (d) {
          return d.name;
        })
        .call(text_center)
        .call(text_display);

      if(treemapClass.isDrilldownEnabled) {
        parentSelection
          .on("click", function (d) {
            if (this.parentNode.className.baseVal.indexOf('children') < 0 && this.nextSibling.style.display === 'none') {
              treemapClass.rows[d.index].children[0].children[0].click();
            }

          });

        texts
          .attr("class", "drilldown")
          .on("click", function (d) {
            this.classList.add('drilldown');
            if (this.parentNode.className.baseVal.indexOf('children') < 0) {
              treemapClass.rows[d.index].children[0].children[0].click();
            }

          });
      }


      g.selectAll('.parent')
        .on("mouseover", function (d) {
          if (this.nextSibling.style.display === 'none' && !transitioning) {
            div.html(d.name);
            //console.log("width of div: " + div[0][0].scrollWidth)
            div.transition()
              .duration(100)
              .style("opacity", 0.9);

            const parentRectWidth = +d3.event.target.attributes.width.value;
            const divWidth = +div[0][0].scrollWidth;
            const arrowWidth = +arrow[0][0].offsetWidth;
            const arrowHeight = +arrow[0][0].offsetHeight;
            const leftPosition = +getPosition(d3.event.target).left;
            const bottomPosition = +getPosition(d3.event.target).bottom;

            div.style("left", (leftPosition + (parentRectWidth - divWidth) / 2) + "px")
              .style("top", (bottomPosition + arrowHeight) + "px");
            arrow.transition()
              .duration(100)
              .style("opacity", 0.9);
            arrow.style("left", (leftPosition + (parentRectWidth - arrowWidth) / 2) + "px")
              .style("top", bottomPosition + "px");

            this.style.cursor = "pointer";
          }
        })
        .on("mouseout", function (d) {
          div.transition()
            .duration(100)
            .style("opacity", 0);

          arrow.transition()
            .duration(100)
            .style("opacity", 0);

          this.style.cursor = undefined;
        });


      // Helper function to get an element's exact position
      function getPosition(elem) {
        // (1)
        const box = elem.getBoundingClientRect();

        const body = document.body;
        const docElem = document.documentElement;

        // (2)
        const scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        // (3)
        const clientTop = docElem.clientTop || body.clientTop || 0;
        const clientLeft = docElem.clientLeft || body.clientLeft || 0;

        // (4)
        const top = box.top + scrollTop - clientTop;
        const bottom = box.bottom + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;
        const right = box.right + scrollLeft - clientLeft;

        return {top: Math.round(top), left: Math.round(left), right: Math.round(right), bottom: Math.round(bottom)}
      }


      function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;


        const g2 = display(d);

        const t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

        // Update the domain only after entering new elements.
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);

        // Enable anti-aliasing during the transition.
        svg.style("shape-rendering", null);

        // Draw child nodes on top of parent nodes.
        svg.selectAll(".depth").sort(function (a, b) {
          return a.depth - b.depth;
        });

        //g1.selectAll(".child").style("fill-opacity", 0);

        t1.selectAll("text").call(text_center).style("fill-opacity", 0);
        t1.selectAll(".child").style("fill-opacity", 0, 'important');
        t1.selectAll(".parent").style("fill-opacity", 0);
        t1.selectAll("rect").call(rect);

        g2.selectAll(".child").style("fill-opacity", 0);
        g2.selectAll("text").style("fill-opacity", 0); // Fade-in entering text.
        g2.selectAll(".parent").style("fill-opacity", 0);

        // Transition to the new view.

        t2.selectAll("text").call(text_center).call(text_display).style("fill-opacity", 1);
        t2.selectAll(".child").style("fill-opacity", 0);
        t2.selectAll(".parent").style("fill-opacity", 0.5);
        t2.selectAll("rect").call(rect);

        // Remove the old node when the transition is finished.
        t1.remove().each("end", function () {
          svg.style("shape-rendering", "crispEdges");
          transitioning = false;
          t1.selectAll("text").call(text_display);
          t2.selectAll("text").call(text_display);
        });
      }

      return g;
    }

    function text_topleft(text) {
      text.attr("dy", ".75em")
        .attr("x", function (d) {
          return x(d.x) + 6;
        })
        .attr("y", function (d) {
          return y(d.y) + 6;
        });
    }

    function text_center(text) {
      text.attr("x", function (d) {
        return x(d.x) + getRectWidth(d) / 2;
      })
        .attr("y", function (d) {
          return y(d.y) + getRectHeight(d) / 2;
        })
        .attr("text-anchor", "middle")
        //.attr("dx", function(d) { return -this.scrollWidth/2; })
        .attr("dy", function (d) {
          return 4;
        })
      //.attr("dy", function(d) { return 0; /*this.scrollHeight/2; */ });
    }


    function text_display(text) {
      text.style('display', function (d) {
        const isHidden = (this.style.display === 'none');
        this.style.display = 'block';
        const widthOfText = this.getBoundingClientRect().width;
        const heightOfText = this.getBoundingClientRect().height;

        let shouldBeShown = ((widthOfText + 8) < getRectWidth(d)) && ((heightOfText + 4) < getRectHeight(d));

        if (BrowserDetection.detectFirefox()) {
          shouldBeShown = ((this.firstChild.length * 6.5 + 16) < getRectWidth(d)) && (18 < getRectHeight(d));
        }

        if (isHidden) {
          this.style.display = 'none';
        }

        if (shouldBeShown) {
          return 'block';
        } else {
          return 'none';
        }
      })
    }

    function rect(rect) {

      rect.attr("x", function (d) {
        return x(d.x);
      })
        .attr("y", function (d) {
          return y(d.y);
        })
        .attr("width", getRectWidth)
        .attr("height", getRectHeight);
    }

    function name(d) {
      return d.parent
        ? name(d.parent) + "." + d.name
        : d.name;
    }

    function getRectWidth(d) {
      return x(d.x + d.dx) - x(d.x);
    }

    function getRectHeight(d) {
      return y(d.y + d.dy) - y(d.y);
    }
  }

  setUpHierarchy(node, parent) {
    let index = 0;
    if (node !== this.root) {
      node.index = parseInt(node.index);
    }
    node.name = reverseEscapeEntities(node.name);
    if (node.children && node.children.length > 0) {
      node.value = undefined;
      for (let i = 0; i < node.children.length; i++) {
        this.setUpHierarchy(node.children[i], node)
      }
    } else {
      node.value = parseFloat(node.value);
      node.parent = parent;
      node.children = undefined;
    }
  }

  flatToHierarchy(flat) {
    const roots = []; // things without parent

    // make them accessible by guid on this map
    const all = {};

    flat.forEach(function (item) {
      all[item.id] = item
    });

    // connect childrens to its parent, and split roots apart
    Object.keys(all).forEach(function (id) {
      const item = all[id];
      if (!item.parent) {
        roots.push(item)
      } else if (item.parent in all) {
        const p = all[item.parent];
        if (!('children' in p)) {
          p.children = []
        }
        p.children.push(item)
      }
    });

    // done!
    return roots;
  }
}

export default ZoomableTreemap;
