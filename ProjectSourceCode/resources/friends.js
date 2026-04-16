// If the warning.hbs file gets updated, we also need to update this to generate the same warnings.
function buildWarningMessage(message, type) {
    if (type != 'error' && type != 'warning' && type != 'info') {
        console.error("buildWarningMessage argument 'type' must be equal to 'warning', 'error', or 'info'.");
        type = 'error';
    }

    let existingWarningMessage = document.getElementById("warningMessage");
    if (existingWarningMessage) {
        existingWarningMessage.remove();
    }

    let warningElement = document.createElement('div');
    warningElement.id = "warningMessage";
    warningElement.classList.add("card");
    warningElement.classList.add("border");
    if (type == 'warning') {
        warningElement.classList.add("border-warning-subtle");
        warningElement.classList.add("bg-warning-subtle");
    } else if (type == 'error') {
        warningElement.classList.add("border-danger-subtle");
        warningElement.classList.add("bg-danger-subtle");
    } else {
        warningElement.classList.add("border-primary-subtle");
        warningElement.classList.add("bg-primary-subtle");
    }

    warningElement.textContent = message;

    let warningContainer = document.getElementById("warningContainer");
    warningContainer.appendChild(warningElement);
}

function convertRequestToFriend(acceptButton) {
    const targetId = `divFor${acceptButton.id}`;
    let target = document.getElementById(targetId);

    // Remove accept button and change decline button(This may need to change when friends.hbs get beautified)
    let delcineButton = acceptButton.parentElement.parentElement.children.item(1);
    delcineButton.textContent = "Remove friend";
    delcineButton.removeEventListener('onclick', declineFriendRequest);
    delcineButton.addEventListener('onclick', (e) => {
        removeFriend(this);
    });
    acceptButton.parentElement.remove();

    const newParent = document.getElementById("friendsColumn");
    newParent.appendChild(target);
}

function removeFriendElement(id) {
    const targetId = `divFor${id}`;
    let target = document.getElementById(targetId);
    
    if (target) {
        target.remove();
    } else {
        console.error(`Div for element ${id} is missing or the id is marked improperly`);
        buildWarningMessage("An error occurred, please reload the page", 'error');
    }
}

async function cancelSendRequest(obj) {
    let response = await fetch(`/requests/sent/${obj.id}`, {
        method: 'DELETE'
    });
    if (response.status == 200) {
        removeFriendElement(obj.id);
    } else {
        buildWarningMessage("An error occurred canceling the friend request, please try again later", 'error');
    }
}

async function acceptFriendRequest(obj) {
    // TODO
    // Send server request
    // If success, add friend to friends column then remove from friend requests
    // If failure, display a warning message about it

    let response = await fetch(`/requests/accept/${obj.id}`, {
        method: 'POST'
    });
    if (response.status == 200) {
        convertRequestToFriend(obj)
    } else {
        buildWarningMessage("An error occurred accepting the friend request, please try again later", 'error');
    }
}

async function declineFriendRequest(obj) {
    let response = await fetch(`/requests/recieved/${obj.id}`, {
        method: 'DELETE'
    });
    if (response.status == 200) {
        removeFriendElement(obj.id);
    } else {
        buildWarningMessage("An error occurred declining the friend request, please try again later", 'error');
    }
}

async function removeFriend(obj) {
    // TODO
    // Send server request
    // If success, remove from friends column
    // If failure, display error message
    let response = await fetch (`/friends/${obj.id}`, {
        method: 'DELETE'
    });

    if (response.status == 200) {
        removeFriendElement(obj);
    } else {
        buildWarningMessage("An error occurred when trying to remove friend, please try again later", 'error');
    }
}