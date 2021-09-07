const htmlparser = require('node-html-parser');
const axios = require('axios').default;
const fs = require('fs');
const json2csv = require('json2csv');

/**
 * Extract pre-defined property information from a Property HTML Element
 * @param  {HTMLElement}    property
 * @return {object}         simple object with all gathered information
 */
function extractPropertyData(property) {
    let results = {};
    results.type   = property.parentNode.id;
    results.id     = property.querySelector('.button a').attributes['data-id'];
    results.name   = property.querySelector('.button a').attributes['data-name'];
    results.price  = property.querySelector('.price b').textContent;
    results.area   = property.querySelector('.meters').textContent;

    if (property.querySelector('.projectListProperty__img .popup-link')) {
        results.image  = property.querySelector('.projectListProperty__img .popup-link').attributes['data-links'];
    }
    if (property.querySelector('.bedroom')) {
        results.rooms  = property.querySelector('.bedroom').textContent;
    }
    if (property.querySelector('.pisos')) {
        results.floors = property.querySelector('.pisos').textContent;
    }

    return results;
}

/**
 * Extract properties data from project record
 * @param  {object}     project
 * @return {object}     more complete project?
 */
function extractProjectProperties_pt2(project, html) {
    // remove `<!doctype html>\n` as htmlparser seens to have no idea what to do with that :\
    const root = htmlparser.parse( html.substring(16) );

    // get properties
    const propertiesHTMLElements = root.querySelectorAll('.projectListProperty');

    // extract data from properties
    project.properties = propertiesHTMLElements.map((property)=>{
        return extractPropertyData(property);
    });

    // is this even pushing to the right node? I made this change after last test...
    results.push(project);
}
function extractProjectProperties_pt1(project,results) {
    const
        domain = 'https://nexoinmobiliario.pe',
        slug_prefix = '/proyecto/venta-de-departamento-',
        url = domain + slug_prefix + project['slug'];

    console.log(url);
    let html;
    console.log(html);
    axios.get(url).then(response => {
        // this should be getting stored/queued and then passed to next function...
        // f'it let's just chain for now...
        extractProjectProperties_pt2(project, response.data, results);
    });
}


/*
 * Test Data
 */
let 
    rawdata = fs.readFileSync('resources/venta-de-departamentos-o-casas-en-miraflores-lima-lima-150122.json'),
    projects = JSON.parse(rawdata),
    overall_results = [];

projects.forEach((project,overall_results)=>{
    extractProjectProperties_pt1(project);
})
fs.writeFileSync('data-150122.json',JSON.stringify(overall_results));


/*
 * Test Data 2
 */
let 
    rawdata2 = fs.readFileSync('resources/venta-de-departamentos-o-casas-en-lima-15.json'),
    projects2 = JSON.parse(rawdata2),
    results2 = [];

projects2.forEach((project,results2)=>{
    extractProjectProperties_pt1(project);
})
fs.writeFileSync('data-15.json',JSON.stringify(results2));
