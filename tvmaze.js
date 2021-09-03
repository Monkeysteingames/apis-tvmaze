/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(q) {
  const res = await axios.get('https://api.tvmaze.com/singlesearch/shows', { params: { q } });
  const id = res.data.id;
  const showName = res.data.name;
  const summary = res.data.summary;
  const image = res.data.image.medium;

  return [
    {
      id,
      showName,
      summary,
      image,
    }
  ]
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.showName}</h5>
             <img class="card-img" src="${show.image}" alt="Show Image">
             <p class="card-text">${show.summary}</p>
             <button id="card-button">Show Episodes</button>
           </div>
         </div>
       </div>
      `);
    //Use JQuery to store the id of the show associated with the card
    $("div").data("show", { id: show.id });
    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const url = (`http://api.tvmaze.com/shows/${id}/episodes`);
  const res = await axios.get(url);
  //make episode array
  let episodes = [];
  //loop through data and filter out only the name, season and episode number - push those values into the empy episode array per episode
  for (let i = 0; i < res.data.length; i++) {
    episodes.push(`${res.data[i].name} (Season: ${res.data[i].season}, Number: ${res.data[i].number})`);
  }
  return episodes;
}

function populateEpisodes(episodes) {
  //declare episode list
  const $episodesList = $("#episodes-list");
  //clear out old values
  $episodesList.empty();
  //loop through episode array and create a new li and add the episode info to it, then append the new li to the list
  for (let episode of episodes) {
    let $item = $(`<li>${episode}</li>`)
    $episodesList.append($item);
  }
}

document.addEventListener('click', async function (evt) {
  if (evt.target && evt.target.id == 'card-button') {

    //retrieve the show id from the data we stored in populateShows() and use for id param in getEpisodes(id)
    let episodes = await getEpisodes($("div").data("show").id);

    $("#episodes-area").show();

    populateEpisodes(episodes);
  }
});