const excContainer = document.getElementById('exc-container');
const jar = {};

function main() {

    // loadContent("LA");
}

// function loadContent(t) {
//     excContainer.innerHTML = ""; // Clear previous content

//     var title = "";
//     switch(t) {
//         case "GL":
//             title = "Getting_Lost";
//             break;
//         case "LA":
//             title = "Little_Art";
//             break;
            
//         default:
//             title = "Unknown";
//     }
//     if (title !== "Unknown") {
//     fetch(`public/contents/${title}.json`)
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
            
//             const titleDiv = document.createElement('div');
//             titleDiv.innerHTML = `<h2>${data.title}</h2><p>${data.author}</p>`;
//             excContainer.appendChild(titleDiv);

            
//             for (const excerpt of data.excerpts) {
//                 const pageNumDiv = document.createElement('div');
//                 pageNumDiv.classList.add('page-num');
//                 pageNumDiv.innerHTML = `<p>[${excerpt.page}]</p>`;
//                 excContainer.appendChild(pageNumDiv);

//                 const excerptDiv = document.createElement('div');
//                 excerptDiv.classList.add('excerpt');
//                 excerptDiv.innerHTML = `<p>${excerpt.content}</p>`;
//                 excContainer.appendChild(excerptDiv);
//             }
//         })
//         .catch(error => console.error('Error fetching data:', error));
//     }
// }



main();