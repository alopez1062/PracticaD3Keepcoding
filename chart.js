const url = "https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/2482274db871e60195b7196c602700226bdd3a44/practica.json";


d3.json(url)
    .then((featuresCollection) => {
        drawMap(featuresCollection)
        drawBarchar();
    })

let dataBarrio = [];


function drawMap(featuresCollection){
    console.log(featuresCollection);
    
    const svg = d3.select("#map")
        .append("svg")
    const height = 800;
    const width = 800;
    svg.attr("width", height)
        .attr("height", width);
    const center = d3.geoCentroid(featuresCollection)
    const projection = d3.geoMercator()
        //.scale(100000)
        .fitSize([width, height - 200], featuresCollection)
        .center(center)
        .translate([width/2, height/2]);

    const pathProjection = d3.geoPath().projection(projection);

    const features = featuresCollection.features;

    const groupMap = svg.append("g").attr("class", "map");
    const subunits = groupMap.selectAll(".subunits")
        .data(features)
        .enter()
        .append("path")

    subunits.attr("d", pathProjection);
    
    const groupBarrio = svg.append("g").attr("class", "barrio");
    groupBarrio.append("text")
        .attr("transform", `translate(100, 120)`)
    
    subunits.on("mouseover", (d) => {
        barrio = d.properties.name;
        groupBarrio.select("text")
            .text(barrio)    
    });
    
    subunits.on("click", (d) => {
        dataBarrio = [];
        for(let i = 0; i < d.properties.avgbedrooms.length; i++){
            console.log(d.properties.avgbedrooms[i])
            dataBarrio.push(d.properties.avgbedrooms[i].total)
        }
        deleteBarChart();
        drawBarchar();
    });
    const colors = d3.schemeReds[6];
    subunits.attr("fill", (d) => {
        let colorSelected;
        
        if(d.properties.avgprice <= 40){
            colorSelected = colors[0];
        } else if(d.properties.avgprice <= 60){
            colorSelected = colors[1];
        } else if(d.properties.avgprice <= 80){
            colorSelected = colors[2];
        } else if(d.properties.avgprice <= 100){
            colorSelected = colors[3];
        } else if(d.properties.avgprice <= 120){
            colorSelected = colors[4];
        } else {
            colorSelected = colors[5];
        }
        return colorSelected;
    })

    const legend = svg.append("g").attr("class", "legend");
    const numberOfLengends = 6;
    const scaleLegend = d3.scaleLinear()
        .domain([0, numberOfLengends])
        .range([0, width]);

    for(let i = 0; i < numberOfLengends; i++){
        const intervals = ["0€-40€", "40€-60€", "60€-80€", "80€-100€", "100€-120€", " más 120€"]
        const posX = scaleLegend(i);
        const legendGroup = legend
            .append("g")
            .attr("transform", `translate(${posX}, 0)`);
        const rectColor = legendGroup
            .append("rect");
        const textLegend = legendGroup
            .append("text")
        const widthRect = (width / numberOfLengends) - 2;
        rectColor
            .attr("width", widthRect)
            .attr("height", 15)
            .attr("fill", colors[i])
        textLegend
            .attr("transform", `translate(${widthRect / 2 - 20}, 40)`)
            .text(intervals[i])
    }
    
}

function drawBarchar(){
    let rectWidth = 90
    const height = 500;
    if(dataBarrio.length == 0){
        dataBarrio = [0,0,0,0,0]
    }
    const maxInput = d3.max(dataBarrio);
    
    const svgBar = d3.select("#bar")
        .append('svg')

    svgBar
        .attr("id", "barchart")
        .attr('width', 500)
        .attr('height', 500)

    const rect = svgBar
        .selectAll('rect')
        .data(dataBarrio)
        .enter()
        .append("rect")
    
    rect
        .attr("class", "barra")
        .attr('x', positionX)
        .attr('y', (d) => height - scale(d))
        .attr('width', rectWidth)
        .attr('height', d => scale(d));

    const text = svgBar.selectAll("text")
        .data(dataBarrio)
        .enter()
        .append('text');

    text.text(d => d)
        .attr("x", (d, i) => positionX(d, i) + 35)
        .attr("y", (d) => positionY(d) - 3);

    function scale(d){
        const scaleNum = (height - 20) / maxInput;
        return scaleNum * d;
    }

    function positionX(d, index){
        return index * (rectWidth + 1)
    }

    function positionY(d){
        return height - scale(d)
    }
}

function deleteBarChart(){
    let element = document.getElementById("barchart");
    element.remove();
}

