document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#individual-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#compose-form').onsubmit = send_email;

  //If is reply, put re infront of subject, fill in recipients and body 
  if (email.id) {
    document.querySelector('#compose-recipients').value = email.sender;
    var reply = (email.subject.slice(0,3)==='RE:') ? '' : 'RE: ';
    console.log(reply)
    document.querySelector('#compose-subject').value = reply + email.subject;
    document.querySelector('#compose-body').value = '\n' + 'On ' + email.timestamp + ' ' + email.sender + ' wrote: ' + '\n' + email.body;
  } else {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  console.log("Compose_email")

}

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value + '\n',
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log("Email Sent: " + document.querySelector('#compose-body').value);
      load_mailbox('sent');
  });
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#individual-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  console.log("load_email")
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // Create a list of all emails in mailbox
      var mainContainer = document.getElementById("emails-view");
      emails.forEach(email => {
        var div = document.createElement("div");
        div.className = 'listed-email';
        var a = (mailbox=='inbox') ? "From: " + email.sender :"To: " + email.recipients; 
        div.style = (email.read==true) ? "background-color:grey" : "background-color:white"
        div.innerHTML =  a + ' Subject: ' + email.subject + ' Sent: ' + email.timestamp;
        div.addEventListener('click', () => display_email(email.id));
        mainContainer.appendChild(div);
      });
  });
}

function display_email(id) {
    // Show the email and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#individual-email').style.display = 'block';

  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Get details of this email and insert into HTML
    document.getElementById("ind-subject").innerHTML = email.subject;
    document.getElementById("ind-sender").innerHTML = "From: " + email.sender;
    document.getElementById("ind-recipients").innerHTML = "To: " + email.recipients;
    document.getElementById("ind-body").innerHTML = email.body;
    document.getElementById("ind-time").innerHTML = email.timestamp;

    //update to read
    update(id,"read")

    //Look for archiving 

    var a = (email.archived == false) ? "archive": "unarchive"
    if (a=="archive") {
      document.querySelector('#archive').innerHTML = `${a.charAt(0).toUpperCase() + a.slice(1)}`;
      document.querySelector('#archive').addEventListener('click', () => update(id,"archive"));
    } else {
      document.querySelector('#archive').innerHTML = `${a.charAt(0).toUpperCase() + a.slice(1)}`;
      document.querySelector('#archive').addEventListener('click', () => update(id,"unarchive"));
    }

    //Look for replying 
    document.querySelector('#reply').addEventListener('click', () => compose_email(email));

  });
}

//Changes the state of read and archived in emails
function update(id, action) {
  if (action=="read") {
    fetch('/emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }
  if (action=="unread") {
    fetch('/emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        read: false
      })
    })
  }
  if (action=="archive") {
    fetch('/emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    .then(load_mailbox('archive'))
  } 
  if (action=="unarchive") {
    fetch('/emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    .then(load_mailbox('inbox'))
  }
}