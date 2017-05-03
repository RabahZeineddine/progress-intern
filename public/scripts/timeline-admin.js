var min = new Date((moment().year() - 1), 1, 1); // 1 april
var max = new Date((moment().year() + 3), 1, 1);
var minCurrent = moment();
var updateToPast = false;


// DOM element where the Timeline will be attached
var container = document.getElementById('visualization');

// Create a DataSet (allows two way data-binding)


xhrGet('/api/getTimeline',function(data){
    if(!data.error){
        drawTimeline(data.timeline);
    }
},function(err){
    console.log(err);
})






function drawTimeline(data){
    
    
}



var groups = [
    {
        id: 1,
        content: 'Rabah'
     }, {
        id: 2,
        content: 'Edison'
        }
    ]

var selectTag = "<select id='taskToInternsSelect' multiple><option value='0'>All</option>";

for(var intern in groups){
    selectTag+= '<option value="'+groups[intern]['id']+'">'+groups[intern]['content']+'</option>'
}
selectTag += "</select>";






var items = new vis.DataSet([
    {
        id: 1,
        title: 'Task 1 ',
        content: '<ul><li>Hello world</li><li>asd</li></ul>',
        group: 1,
        start: '2017-04-20'
     },
    {
        id: 2,
        title: 'Task 2 ',
        content: 'item 2',
        group: 2,
        start: '2017-04-14'
     },
    {
        id: 3,
        title: 'Task 3 ',
        content: 'item 3',
        group: 1,
        start: '2017-04-18'
     },
    {
        id: 4,
        
        content: 'item 4',
        group: 2,
        start: '2017-04-16',
        end: '2017-04-19'
     }
  ]);

// Configuration for the Timeline
var options = {
    width: '100%',
    margin: {
        item: 20
    },
    multiselect: true,
    min: min,
    max: max,
    editable: {
        add: true, // add new items by double tapping
        updateTime: true, // drag items horizontally
        updateGroup: true, // drag items from one group to another
        remove: true, // delete an item by tapping the delete button top right
        overrideItems: false // allow these options to override item.editable
    },
    groupOrder: 'content',

    onAdd: function (item, callback) {
        if(item.start.getTime() < minCurrent){ item.start = minCurrent; updateToPast = true;}
        
        swal({
            title: "Add new task",
            text: "Enter content for the new task: <br><br><textarea rows='5' cols='40' id='addTaskContent'>New task</textarea><br><br>"+selectTag,
            html:true,
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel plx!',
            closeOnConfirm : false
        },function(isConfirm){
            item.content = document.getElementById('addTaskContent').value.split('\n').join('<br>');
            var select = document.getElementById('taskToInternsSelect').options;
            var result = [];
            for(var i =0 ; i < select.length;i++){
                if(select[i].selected) result.push(select[i].value);
            }
            
            
             if (isConfirm) {
                swal("Added!","The task has been added.", "success");
                if(result.length==1 && result[0] != 0) {item.group = result[0]; callback(item);}
                 else if(result.length == 1 && result[0] == 0){

                     for(var group in groups){
                         item.group = groups[group]['id'];
                         delete item.id;
                         items.add(item);
                         
                     }
//                     timeline.focus(item.id);
//                     timeline.setItems(items);
                     callback(null);
                 }else{
                     for(var id in result){
                         delete item.id;
                         item.group = result[id];
                         items.add(item);
                         
                     }
//                     callback(test);
//                     timeline.focus(item.id);
//                     timeline.setItems(items);
                     callback(null);
                 }
                 
                 
            } else
                callback(null);
        });
    },

    onUpdate: function (item, callback) {
        item.content = swal({
           title: 'Update task',
            text: "Update task's content: <br> <textarea rows='5' cols='40' id='updateTaskContent'>"+item.content.split('<br>').join('\n')+"</textarea> ",
            html: true,
            showCancelButton : true,
            confirmButtonText : 'Yes, update it!',
            cancelButtonText: 'No, cancel plx!',
            closeOnConfirm : false
        },function(isConfirm){
            item.content = document.getElementById('updateTaskContent').value.split('\n').join('<br>');
             if (isConfirm) {
                swal("Updated!","The task has been updated.", "success");
                 
                callback(item);
                 timeline.focus(item.id);
            } else
                callback(null);
        });
    
    },
    onMoving: function (item, callback) {

        callback(item);
    },
    onMove: function (item, callback) {
        var text = "Do you really want to move the task's start time to: " + item.start;
        if (item.end) text += ' and end time to: ' + item.end;
        swal({
            title: 'Move task',
            text: text,
            type: 'info',
            confirmButtonText: 'Yes, move it!',
            showCancelButton: true,
            cancelButtonText: 'No, cancel plx!',
            closeOnConfirm: false
        }, function (isConfirm) {
            if (isConfirm) {
                swal("Moved!", "The task has been moved.", "success");
                
                callback(item);
                timeline.focus(item.id);
            } else
                callback(null);
        })
        callback(item);
    },
    onRemove: function (item, callback) {
        swal({
            title: 'Remove task',
            text: 'Do you really want to remove the task?' ,
            type: 'warning',
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            showCancelButton: true,
            cancelButtonText: 'No, cancel plx!',
            closeOnConfirm: false
        }, function (isConfirm) {
            if (isConfirm) {
                swal("Deleted!","The task has been deleted.", "success");
                callback(item);
            } else
                callback(null);
        });
    }

};

// Create a Timeline
var timeline = new vis.Timeline(container, items, groups, options);



//function asd(){
//    alert('asd');
//}
//
//function test(){
//    swal({
//        title: 'An input!',
//        text : 'You will not be able to <select onchange="asd();"><option value="">Default</option><option value="hello">hello</option></select> recover this imaginary file!',
//        type: 'input',
//        inputType: 'password',
//        showCancelButton: true,
//        confirmButtonColor: '#DD6B55',
//        confirmButtonText : 'Yes, delete it!',
//        cancelButtonText : 'No, cancel plx!',
//        showLoaderOnConfirm : true,
//        html: true,
//        closeOnConfirm : false,
//        
//    },function(){
//        
//        swal("Deleted!","Your imaginary file has been deleted.","success");
//        
//    });
//}
