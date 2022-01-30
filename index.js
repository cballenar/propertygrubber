const htmlparser = require('node-html-parser');
const axios = require('axios').default;
const fs = require('fs');
const json2csv = require('json2csv');

/**
 * Get arguments
 * 1st Batch ID
 * 2nd Source File
 * 3rd Number of items to process/leave empty for all
 *
 */ 
batchId = process.argv[2]
batchSource = process.argv[3]
batchSize = process.argv[4]

/**
 * Pacer
 * Iterates over a list, processes each item and returns the processed value
 * in a new array.
 * 
 * @param {Array} projects List of items to process
 * @param {Number} delay Time in milliseconds to delay each item
 * @returns {Array} New list of processed items
 */
 function pacer(projects, key=Date.now().toString(), delay=1000) {
    const
        domain = 'https://nexoinmobiliario.pe',
        slug_prefix = '/proyecto/venta-de-departamento-';
    const startTime = Date.now();
    const new_projects = [];
    const name = 'processed-'+key+'.json';

    function processProperty(project, response) {
        // start with a clean project
        const new_project = {};
        new_project.snapshot_date = key;

        // add only required keys in the order needed (for use in Google Sheets)
        let sorted_keys = ["url","project_id","project_contact","project_email","project_phone","project_cell_phone","project_whatsapp","name","type_project","project_phase","distrito","direccion","provincia_project","dpto_project","slug","coin","builder_name","builder_slug","socio_asei","coord_lat","long","finance_bank"];
        sorted_keys.forEach(el=>{ new_project[el] = project[el]; })

        // let's do a bit of cleanup of the project data
        // let junk_keys = ["image","tour_virtual","visibility_in_feria_nexo","min_price","val_price1","val_price2","room_min","room_max","area_min","area_max","bathroom_min","bathroom_max","parking_min","parking_max","cantidad","logo_empresa","visibility_semananexo","cintillo_principal","important_level","is_featured","url_video","gallery","keyword","gallery_xm","gallery_big","services"];
        // junk_keys.forEach(el => {delete project[el];} )

        // remove `<!doctype html>\n` as htmlparser seens to have no idea what to do with that :\
        const html = response.data.substring(16);
        const root = htmlparser.parse( html );
    
        // get properties
        const propertiesHTMLElements = root.querySelectorAll('.projectListProperty');

        // extract summary from properties as new array in project.properties
        new_project.properties = propertiesHTMLElements.map((property)=>{
            let property_summary = {};
            property_summary.id     = property.querySelector('.button a').attributes['data-id'];
            property_summary.name   = property.querySelector('.button a').attributes['data-name'];
            property_summary.type   = property.parentNode.id;
            property_summary.price  = property.querySelector('.price b').textContent;
            property_summary.area   = property.querySelector('.meters').textContent;
            // this is also junk
            // if (property.querySelector('.projectListProperty__img .popup-link')) {
            //     property_summary.image  = property.querySelector('.projectListProperty__img .popup-link').attributes['data-links'];
            // }
            if (property.querySelector('.bedroom')) {
                property_summary.rooms  = property.querySelector('.bedroom').textContent;
            }
            if (property.querySelector('.pisos')) {
                property_summary.floors = property.querySelector('.pisos').textContent;
            }
            return property_summary;
        });
        return new_project;
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
let rawdata = fs.readFileSync(batchSource),
    projects = JSON.parse(rawdata);

if (batchSize != undefined) {
    // sample data
    sample = projects.slice(0,batchSize);
    let sample_projects = pacer(sample, batchId, 1500);
} else {
    // all data
    let processed_projects = pacer(projects, batchId, 1500);
}

