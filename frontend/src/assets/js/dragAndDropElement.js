function draggableElement(id) {
    $(document).ready(() => {

        $("#" + id).draggable({
            drag: () => {
               
            }
        }).resizable({
            handles: "n, e, s, w , ne , sw , nw , se",
            resize: () => {}
        })
    })

}

