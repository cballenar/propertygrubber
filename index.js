const htmlparser = require('node-html-parser');
const axios = require('axios').default;
const fs = require('fs');
const json2csv = require('json2csv');

// this experiment ti delay requests and avoid 502s didn't quite work as was attempted in combo with a map asynchronously. Took me a while to figure out what was happening.
function waitToExtract(project) {
    const min = 600,
          max = 2400,
          rand = Math.floor(Math.random() * (max - min + 1) + min),
          results = new Promise(
      (resolve) => {
          setTimeout(() => {
              resolve(project)
          }, rand);
      }).then((project)=>{return project;});

    return results;
}

/**
 * Extract properties data from project record
 * @param  {object}     project
 * @return {object}     more complete project?
 */
async function extractProjectProperties(project) {
    const
        domain = 'https://nexoinmobiliario.pe',
        slug_prefix = '/proyecto/venta-de-departamento-',
        url = domain + slug_prefix + project['slug'];

    const processed_project = axios.get(url)
        .then((response) => {
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
        })
        .catch((error)=>{
            project.properties = [{"name":error.message+' :: '+error.config.url}];
            return project;
        });
    return processed_project;
}


/*
 * Test Data
 */
let file_name = 'venta-de-departamentos-o-oficinas-o-lotes-o-casas-en-lima-15-20211001.json',
    rawdata = fs.readFileSync('resources/'+file_name),
    projects = JSON.parse(rawdata);

// [!] need to change map for a loop instead so that we don't get 502s due to overload
complete_projects = Promise
    .all(projects.map(extractProjectProperties))
    .then((results)=>{
        fs.writeFileSync( 'processed-'+file_name, JSON.stringify(results) );
        return results;
    })
    .catch((error)=>{
        console.log(error);
    });
