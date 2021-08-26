  <?php
  include "header.php"
  ?>

  <style type="text/css">
    .row {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display:         flex;
      flex-wrap: wrap;
    }
    .row > [class*='col-'] {
      display: flex;
      flex-direction: column;
    }
  </style>

  <!-- Jumbotron -->
  <div class="p-3 mb-2 mt-2 bg-light rounded-3 border border-dark">
    <div class="container-fluid py-1 rounded-5">
      <h1 class="display-5 fw-bold">Crowdfunding & E-Charity</h1>
      <p class="col-md-8 fs-4">Final year project by students of (Computer System Engineering) CSE.</p>
      <button class="btn btn-primary btn-lg" type="button">About</button>
    </div>
  </div>

  <!-- Funding Catagories -->
  <div class="row align-items-md-stretch ">
    
    <div class="col-md-4 p-2">
      <div class="h-100 p-4 text-white bg-dark rounded-3">
        <center><h2>Donate Charity</h2>
        <p>Donate charity to the organization of your choice.</p>
        <div class="btn btn-outline-light" type="button">Donate<sub>(Comming Soon)</sub></div></center>
      </div>
    </div>

    <div class="col-md-4 p-2">
      <div class="h-100 p-4 text-white bg-dark rounded-3">
        <center><h2>Zakat Calculator</h2>
        <p>Calculate Zakat based on your assets and pay Zakat to organization of your choice.</p>
        <button class="btn btn-outline-light" type="button" onclick="goToPage('zakat.php')">Zakat Calculator</button></center>
      </div>
    </div>

    <div class="col-md-4 p-2">
      <div class="h-100 p-4 text-white bg-dark rounded-3">
        <center><h2>Apply for Crowdfunding</h2>
        <p>Apply for Crowdfunding.</p>
        <div class="btn btn-outline-light" type="button">Crowdfunding<sub>(Comming Soon)</sub></div></center>
      </div>
    </div>
  </div>
  <hr>
  <h2>Current Status</h2>
  <!-- Tables -->
    <table class="table table-hover" id="progress-table">
    <thead>
    <tr>
      <th scope="col" class="col-md-3">Name</th>
      <th scope="col">Current Amount</th>
      <th scope="col">Total Amount</th>
      <th scope="col">Progress</th>
    </tr>
    </thead>
  </table>

      <div id = "demo"></div>
</div>


<script>
  var result = "";
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var jsonObj = JSON.parse(this.responseText);
      // document.getElementById("demo").innerHTML = jsonObj[0]["name"];
      for(var i = 0; i < jsonObj.length; i++) {
          var obj = jsonObj[i];
          var per = Math.floor(obj.collectedAmount*100/obj.totalAmount);
          // console.log(Math.floor(obj.collectedAmount*100/obj.totalAmount))
          result += "<tr class=\"table-success\">";
          result += "<th scope=\"row\">"+obj.name+"</th>";
          result += "<td scope=\"row\">"+obj.collectedAmount+"</td>"
          result += "<td scope=\"row\">"+obj.totalAmount+"</td>"
          result += "<td> <div class=\"progress\"> <div class=\"progress-bar progress-bar-striped bg-primary progress-bar-animated\" role=\"progressbar\" style=\"width: "+per+"%\" aria-valuenow=\""+per+"\" aria-valuemin=\"0\" aria-valuemax=\"100\">"+per+"%</div> </div> </td>"
          result += "</tr>";
      }
      document.getElementById("progress-table").innerHTML += result;
    }
  };
  xmlhttp.open("POST", "./getStatus.php", true);
  xmlhttp.send();

  function goToPage(page){
    window.location.href = page;
  }

</script>

<?php
  include "footer.php"
?>