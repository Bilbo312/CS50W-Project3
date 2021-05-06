document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#compose-form').onsubmit = send_email;
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  console.log("Compose_email")

}

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
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
      for (var i = 0; i < emails.length; i++) {
        var div = document.createElement("div");
        div.className = 'listed-email';
        var a = (mailbox=='inbox') ? "From: " + emails[i].sender :"To: " + emails[i].recipients; 
        var b = emails[i].id;
        console.log(b);
        div.innerHTML =  a + ' Subject: ' + emails[i].subject + ' ' + emails[i].timestamp +' Body: ' + emails[i].body;
        div.addEventListener('click', () => display_email(b)); //Only puts 1 in for some reason 
        mainContainer.appendChild(div);
      }
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

    // Get details of this email
    document.getElementById("ind-subject").innerHTML = email.subject;
    document.getElementById("ind-sender").innerHTML = "From: " + email.sender;
    document.getElementById("ind-recipients").innerHTML = "To: " + email.recipients;
    document.getElementById("ind-body").innerHTML = email.body;
    document.getElementById("ind-time").innerHTML = email.timestamp;
  });
}