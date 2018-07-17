initiateDirectionButtons()
function initiateDirectionButtons() {
    let buttonDirs = ["north", "west", "east", "south", "southeast", "southwest", "northeast", "northwest", "home"]
    console.log(buttonDirs.length)

    for (i = 0; i < buttonDirs.length; i++) {
        console.log(buttonDirs[i])

        $('#' + buttonDirs[i]).on('click', function () {
            travel("'" + buttonDirs[i] + "'");
        });

    }
}
