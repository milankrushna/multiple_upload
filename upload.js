/**
 * 
 * Author : MIlan Krushna
 * Created On : 21-02-2020
 * Profile : http://milankrushna.com
 * 
 */
  
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