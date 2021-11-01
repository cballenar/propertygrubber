const htmlparser = require('node-html-parser');
const axios = require('axios').default;
const fs = require('fs');
const json2csv = require('json2csv');

/**
 * Pacer
 * Iterates over a list, processes each item and returns the processed value
 * in a new array.
 * 
 * @param {Array} projects List of items to process
 * @param {Number} delay Time in milliseconds to delay each item
 * @returns {Array} New list of processed items
 */
 function pacer(projects, name=Date.now().toString(), delay=1000) {
    const
        domain = 'https://nexoinmobiliario.pe',
        slug_prefix = '/proyecto/venta-de-departamento-';
    const startTime = Date.now();
    const new_projects = [];

    function processProperty(project, response) {
        // remove `<!doctype html>\n` as htmlparser seens to have no idea what to do with that :\
        const html = response.data.substring(16);
        const root = htmlparser.parse( html );
    
        // get properties
        const propertiesHTMLElements = root.querySelectorAll('.projectListProperty');
    
        // extract summary from properties as new array in project.properties
        project.properties = propertiesHTMLElements.map((property)=>{
            let property_summary = {};
            property_summary.type   = property.parentNode.id;
            property_summary.id     = property.querySelector('.button a').attributes['data-id'];
            property_summary.name   = property.querySelector('.button a').attributes['data-name'];
            property_summary.price  = property.querySelector('.price b').textContent;
            property_summary.area   = property.querySelector('.meters').textContent;
            if (property.querySelector('.projectListProperty__img .popup-link')) {
                property_summary.image  = property.querySelector('.projectListProperty__img .popup-link').attributes['data-links'];
            }
            if (property.querySelector('.bedroom')) {
                property_summary.rooms  = property.querySelector('.bedroom').textContent;
            }
            if (property.querySelector('.pisos')) {
                property_summary.floors = property.querySelector('.pisos').textContent;
            }
            return property_summary;
        });
        return project;
    }

    function paceList(i=0) {
        var project = projects[i];
        const url = domain + slug_prefix + project['slug'];
        console.log(`[${i}] Processing: ${url}`);

        axios.get(url)
            .then(response => {
                console.log(`[${i}] Completed.`);
                let newProject = processProperty(project,response);
                new_projects.push(newProject);
                i++;
                if (i < projects.length) {
                    paceList(i);
                } else {
                    console.log(`Total: ${(Date.now() - startTime) / 1000} seconds.`);
                    fs.writeFileSync(name, JSON.stringify(new_projects));
                    return new_projects;
                }
            })
            .catch((error)=>{
                console.log(`[${i}] Errored.`);
                project.properties = [{"name":error.message+' :: '+error.config.url}];
                new_projects.push(project);
                i++;
                if (i < projects.length) {
                    paceList(i);
                } else {
                    console.log(`Total: ${(Date.now() - startTime) / 1000} seconds.`);
                    fs.writeFileSync(name, JSON.stringify(new_projects));
                    return new_projects;
                }
            });
    }
    console.log(`Starting at ${startTime}. Processing ${projects.length} projects.`)
    return paceList();
}

/*
 * Test Data
 */
let file_name = 'venta-de-departamentos-o-oficinas-o-lotes-o-casas-en-lima-15-20211101.json',
    rawdata = fs.readFileSync('resources/'+file_name),
    projects = JSON.parse(rawdata);

// sample data
sample = projects.slice(0,10);
let sample_projects = pacer(sample, 'processed-sample-20211101.json', 1500);

sample_2 = projects.slice(10,20);
let sample_projects_2 = pacer(sample_2, 'processed-sample-20211101-2.json', 1500);

sample_3 = projects.slice(20,30);
let sample_projects_3 = pacer(sample_3, 'processed-sample-20211101-3.json', 1500);

// all data
let processed_projects = pacer(projects, 'processed-'+file_name, 1500);