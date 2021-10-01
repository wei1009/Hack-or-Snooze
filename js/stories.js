"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, deleteBtn = false) {
  console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}" class="story">
       ${deleteBtn ? getDeleteBtn() : ""}
       ${showStar ? getStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/*Vivian add
* it will appear in the My Stories Lists
*/
function getDeleteBtn(){
  return`
  <span class="delete">
    <span class="yes trashCan"></span>
  </span>
  `
}

/*Vivian add
*it will appear in all Lists
*isFavorite show whether it's favorite mark
*/
function getStar(story,user){
  const isFavorite = user.isFavorite(story);
  return`
      <span class="star" isFavorite="${isFavorite}">
      </span>
    `
}


/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/*Vivian add
*delete a story and the page will put again on page
*/
async function deleteStory(evt){
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);
  putUserStoriesOnPage();

}


/*Vivian add
*submit new stories event,
*save the currentUser data and reset the form
*/
async function submitNewStory(evt){
  evt.preventDefault();

  const author = $("#creatAuthor").val();
  const title = $("#creatTitle").val();
  const url = $("#creatURL").val();
  const username = currentUser.username;
  const storyInfo = {title, url, author, username};

  const story = await storyList.addStory(currentUser, storyInfo);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");

}


/*Vivian add
*put user's stories on page
*if there is no story, show warning
*/
function putUserStoriesOnPage(){
  console.debug("putUserStoriesOnPage");
  $myStories.empty();

  if (currentUser.ownStories.length === 0){
    $myStories.append("<div>No Stories Added!</div>");
  }else{
    for(let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story,true);
      $myStories.append($story);
    }
  }
  $myStories.show();
}


/*Vivian add
*put user's favorite stories on page
*if there is no story, show warning
*/
function putFavoritesListOnPage(){
  //console.debug("putFavoriteListOnPage");

  $favoriteStories.empty();

  if (currentUser.favorites.length === 0){
    $favoriteStories.append("<div>No Favorite Stories Added!</div>");
  }else{
    for(let story of currentUser.favorites){
      let $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
    }
  }
  $favoriteStories.show();
}


/*Vivian add
*When I click the favorite mark
*isFavorite attribute will change to show if it mark as favorite
*/
async function updateStoryFavorite(evt) {
  console.debug("updateStoryFavorite");

  const $target =$(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($target.attr("isFavorite") == 'true'){
    $target.attr("isFavorite", 'false');
    await currentUser.removeFavorite(story);
  }
  else{ //If it's not favorite originally
    $target.attr("isFavorite", 'true');
    await currentUser.addFavorite(story);
  }

  if($favoriteStories.is(':visible')){
    putFavoritesListOnPage();
  }

}

//click favorite mark listener
$storiesLists.on("click", ".star", updateStoryFavorite);
//submit to add new story listener
$submitForm.on("submit", submitNewStory);
//click to delete listener
$myStories.on("click", ".trashCan", deleteStory);
