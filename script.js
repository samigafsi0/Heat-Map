let url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"; // the JSON url

let rawData = {};
let dataSet = []; // data array
const req = new XMLHttpRequest(); //HTTP request to get the data

//graph dimensions
const width = 1400;
const height = 600;
const legendWidth = 600;
const legendHeight = 100;
const barSize = 40;
const paddingBottom = 50;
const paddingLeft = 70;
const padding = 40;
const paddingLegend = 50;

let xScale;
let yScale;
let tempScale;
let xAxis;
let yAxis;
let tempAxis;
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let baseTemp;
let colorScale;

const svgGraph = d3.select("#graph");
const svgLegend = d3.select("#legend");
let tooltip = d3
  .select("#main")
  .append("div")
  .attr("id", "tooltip")
  .style("visibility", "hidden");
let text1 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text1")
  .attr("class", "info");
let text2 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text2")
  .attr("class", "info");
let text3 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text3")
  .attr("class", "info");

const drawGraph = () => {
  svgGraph.attr("width", width).attr("height", height);
  svgLegend.attr("width", legendWidth).attr("height", legendHeight);
};
const createScales = () => {
  xScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataSet, (item) => item.year),
      d3.max(dataSet, (item) => item.year),
    ])
    .range([paddingLeft, width - padding]);

  yScale = d3
    .scaleBand()
    .domain(months)
    .range([padding, height - paddingBottom]);

  tempScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataSet, (item) => item.temperature),
      d3.max(dataSet, (item) => item.temperature),
    ])
    .range([paddingLegend, legendWidth - paddingLegend]);

  colorScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataSet, (item) => item.temperature),
      d3.max(dataSet, (item) => item.temperature),
    ])
    .range([0, 100]);
};

const drawAxes = () => {
  xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  svgGraph
    .append("g")
    .attr("id", "x-axis")
    .call(xAxis)
    .attr("transform", "translate(0, " + (height - paddingBottom) + ")");

  yAxis = d3.axisLeft(yScale);
  svgGraph
    .append("g")
    .attr("id", "y-axis")
    .call(yAxis)
    .attr("transform", "translate(" + paddingLeft + ", 0)");

  tempAxis = d3.axisBottom(tempScale);
  svgLegend
    .append("g")
    .call(tempAxis)
    .attr("transform", "translate(0," + (legendHeight - paddingLegend) + ")");
};

const createCells = () => {
  let cellWidth =
    width /
    (d3.max(dataSet, (item) => item.year) -
      d3.min(dataSet, (item) => item.year) +
      1);
  let cellHeight =
    (height - padding - paddingBottom) /
    (d3.max(dataSet, (item) => item.month) -
      d3.min(dataSet, (item) => item.month));

  svgGraph
    .selectAll("rect")
    .data(dataSet)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("width", cellWidth - 1)
    .attr("height", cellHeight)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(months[d.month]))
    .attr("fill", (d) => {
      return colorPicker(colorScale(d.temperature));
    })
    .attr("data-month", (d) => d.month)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => d.temperature)
    .on("mouseover", (nothing, d) => {
      tooltip.style("visibility", "visible");
      console.log(d.year);
      tooltip.style("left", () => {
        return "calc(50vw + " + (xScale(d.year) - width / 2) + "px + 15px)";
      });
      tooltip.style("top", () => {
        return (
          "calc(100vh - " +
          (yScale(months[11 - d.month]) +
            legendHeight +
            paddingBottom +
            cellHeight) +
          "px - 50px)"
        );
      });
      text1.text(d.year + " - " + months[d.month]);
      text2.text(d.temperature + " ℃");
      text3.text(d.variance);
      document.querySelector("#tooltip").setAttribute("data-year", d.year);
    })
    .on("mouseout", (nothing, d) => {
      tooltip.style("visibility", "hidden");
    });
};

const colorPicker = (item) => {
  switch (true) {
    case item <= 10:
      return "#1C6FF8";
    case item <= 20:
      return "#27BBE0";
    case item <= 30:
      return "#31DB92";
    case item <= 40:
      return "#1BF118";
    case item <= 50:
      return "#9BFA24";
    case item <= 60:
      return "#fff314";
    case item <= 70:
      return "#FBB806";
    case item <= 80:
      return "#F6830C";
    case item <= 90:
      return "#F24D11";
    case item <= 100:
      return "#ED1717";
  }
};

const drawLegend = () => {
  const legendData = [
    "10",
    "20",
    "30",
    "40",
    "50",
    "60",
    "70",
    "80",
    "90",
    "100",
  ];
  svgLegend
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("width", (legendWidth - 2 * paddingLegend) / 10)
    .attr("height", barSize)
    .attr("fill", (d) => {
      return colorPicker(d);
    })
    .attr("x", (d) => d * 5)
    .attr("y", legendHeight - paddingLegend - barSize);
};

req.open("GET", url, true);
req.onload = () => {
  rawData = JSON.parse(req.responseText);
  baseTemp = rawData.baseTemperature;
  dataSet = [...rawData.monthlyVariance].map((item) => {
    return {
      year: item.year,
      month: item.month - 1,
      variance: item.variance,
      temperature: Math.round(baseTemp * 10 + item.variance * 10) / 10,
    };
  });
  drawGraph();
  createScales();
  drawAxes();
  createCells();
  drawLegend();
};
req.send();
