# multiple_upload

How to upload multiple files using PHP, jQuery, and AJAX

I have written this code which allows the user to upload images/files. The main aspect of this system allows you to upload multiple files one after another with a progress bar, not in one request.
You have to only select multiple files at once and click on the start button.
# HTML
<pre>
<input type="file" id="multiupload" name="uploadFiledd[]" multiple >
<button type="button" id="upcvr" class="btn btn-primary">Start Upload</button>
<div id="uploadsts"></div>
</pre>

#Javascript
<pre>
<script>

    function uploadajax(ttl,cl){

    var fileList = $('#multiupload').prop("files");
    $('#prog'+cl).removeClass('loading-prep').addClass('upload-image');

    var form_data =  "";

    form_data = new FormData();
    form_data.append("upload_image", fileList[cl]);


    var request = $.ajax({
              url: "upload.php",
              cache: false,
              contentType: false,
              processData: false,
              async: true,
              data: form_data,
              type: 'POST', 
              xhr: function() {  
                  var xhr = $.ajaxSettings.xhr();
                  if(xhr.upload){ 
                  xhr.upload.addEventListener('progress', function(event){
                      var percent = 0;
                      if (event.lengthComputable) {
                          percent = Math.ceil(event.loaded / event.total * 100);
                      }
                      $('#prog'+cl).text(percent+'%') 
                   }, false);
                 }
                 return xhr;
              },
              success: function (res, status) {
                  if (status == 'success') {
                      percent = 0;
                      $('#prog' + cl).text('');
                      $('#prog' + cl).text('--Success: ');
                      if (cl < ttl) {
                          uploadajax(ttl, cl + 1);
                      } else {
                          alert('Done');
                      }
                  }
              },
              fail: function (res) {
                  alert('Failed');
              }    
          })
    }

    $('#upcvr').click(function(){
        var fileList = $('#multiupload').prop("files");
        $('#uploadsts').html('');
        var i;
        for ( i = 0; i < fileList.length; i++) {
            $('#uploadsts').append('<p class="upload-page">'+fileList[i].name+'<span class="loading-prep" id="prog'+i+'"></span></p>');
            if(i == fileList.length-1){
                uploadajax(fileList.length-1,0);
            }
         }
    });
    </script>
    </pre>
#PHP
<pre>
upload.php

$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["upload_image"]["name"]);
if (move_uploaded_file($_FILES["upload_image"]["tmp_name"], $target_file)) {
header("Content-Type:application/json");
echo json_encode(
array(
"status"=>1,
"message"=>"The file ". $target_file. " has been uploaded."
));
} else {
header("Content-Type:application/json");
echo json_encode(
array("status"=>0,
"message"=>"Sorry, there was an error uploading your file."
));
}
</pre>
