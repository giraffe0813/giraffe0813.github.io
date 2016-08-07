var disqusCSS = '\
    #disqus_thread {\
      margin: 0;\
      padding: 0;\
      width: 100%;\
      background-color: #fff;\
      list-style: none;\
    }\
    .disqus_lists {\
      list-style: none;\
      margin: 0;\
      padding: 0;\
    }\
    .disqus_comment {\
      overflow: auto;\
      padding: 10px;\
    }\
    .disqus_comment .username {\
      font-weight: 700;\
      margin-right: 10px;\
      color: rgb(56, 183, 234);\
    }\
    .disqus_comment .avatar {\
      width: 48px;\
      height: 48px;\
      float: left;\
      margin-right: 15px;\
      vertical-align: middle;\
    }\
    .disqus_comment .date {\
      color: #7f919e;\
      font-weight: 500;\
    }';

function dateFormat(raw) {
  var date = new Date(raw);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  return year + '.' + month + '.' + day;
}

document.addEventListener('DOMContentLoaded', function() {
  var $commentsContainer = document.querySelector('#disqus_thread');
  var $tplComment = document.querySelector('#tpl-post');
  var $input = document.querySelector('#url');
  var xhr = new XMLHttpRequest();
  var $style = document.createElement('style');

  $style.type = 'text/css';
  $style.appendChild(document.createTextNode(disqusCSS));

  document.head.appendChild($style);

  xhr.open('get', 'http://xiaoming.io/disqus/comments');
  xhr.send();

  xhr.onreadystatechange = function() {
    if (+xhr.readyState === 4) {
      var raw = JSON.parse(xhr.responseText);
      var $container = document.createElement('ul');

      $container.classList.add('disqus_lists');

      raw.response.forEach(function(comment) {
        $container.appendChild(createComment(comment));
      });

      $commentsContainer.appendChild($container);
    }
  }

  function createComment(comment) {
    var $itemContainer = document.createElement('li');
    var $avatar = document.createElement('img');
    var $username = document.createElement('span');
    var $date = document.createElement('span');
    var $comment = document.createElement('p');
    
    $itemContainer.classList.add('disqus_comment');
    $avatar.classList.add('avatar');
    $username.classList.add('username');
    $date.classList.add('date');
    $comment.classList.add('comment');

    $avatar.src = comment.author.avatar.cache;
    $username.innerHTML = comment.author.username;
    $date.innerHTML = dateFormat(comment.createdAt);
    $comment.innerHTML = comment.raw_message;

    $itemContainer.appendChild($avatar);
    $itemContainer.appendChild($username);
    $itemContainer.appendChild($date);
    $itemContainer.appendChild($comment);

    return $itemContainer;
  }
});