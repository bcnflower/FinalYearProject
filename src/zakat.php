<?php
include "header.php"
?>

<div class="mt-2 mb-2">
	<center>
		<h1>Zakat Calculator</h1>
	</center>
</div>

<table class="table table-hover table-bordered">
    <thead>
    <tr class="table-success">
      <th scope="col">Asset Type</th>
      <th scope="col">Rate (Rs.)</th>
    </tr>
    </thead>
    <tr class="table-secondary">
    	<th>Silver Per Gram</th>
    	<td><input type="number" name="s1g" id="s1g" min="0" onchange="updateTotalAmounts();"></td>
    </tr>
    <tr>
    	<th>Silver Per Tola</th>
    	<td><input type="number" name="s1t" id="s1t" min="0" onchange="updateTotalAmounts();"></td>
    </tr>
    <tr class="table-secondary">
    	<th>Gold 24K per Gram</th>
    	<td><input type="number" name="24g1g" id="24g1g" min="0" onchange="updateTotalAmounts();"></td>
    </tr>
    <tr>
    	<th>Gold 24K per Tola</th>
    	<td><input type="number" name="24g1t" id="24g1t" min="0" onchange="updateTotalAmounts();"></td>
    </tr>
    <tr class="table-secondary">
    	<th>Gold 22K per Gram</th>
    	<td><input type="number" name="22g1g" id="22g1g" min="0" onchange="updateTotalAmounts();"></td>
    </tr>
    <tr>
    	<th>Gold 22K per Tola</th>
    	<td><input type="number" name="22g1t" id="22g1t" min="0" onchange="updateTotalAmounts();"></td>
    </tr>
    <tr>
    	<td colspan="2">
    		<center>
    			<button class="btn btn-primary" type="button" id="updateBtn"  onclick="updateRates();">Update Rates</button>
    		</center>
    	</td>
    </tr>
  </table>

  <h2>My Assets</h2>

  <table class="table table-hover">
    <tr>
    	<th>Gold Amount:</th>
    	<td><input class="w-75" type="number" name="goldAmount" id="goldAmount" min="0" onchange="updateTotalAmounts();"></td>
    	<td>
    		<select name="goldUnit" id="goldUnit" onchange="updateTotalAmounts();">
				<option value="g">Gram</option>
			  	<option value="t">Tola</option>
			</select>
		</td>
		<td>
    		<select name="goldCarret" id="goldCarret" onchange="updateTotalAmounts();">
				<option value="22K">22K</option>
			  	<option value="24K">24K</option>
			</select>
		</td>
    </tr>
    <tr>
    	<th>Gold Price Total:</th>
    	<td colspan="3"><input class="w-50" type="number" name="goldPriceTotal" id="goldPriceTotal" min="0">&nbsp;<b>Rs</b></td>
    </tr>
    <tr>
    	<th>Silver Amount:</th>
    	<td><input class="w-75" type="number" name="silverAmount" id="silverAmount" min="0" onchange="updateTotalAmounts();"></td>
    	<td>
    		<select name="silverUnit" id="silverUnit" onchange="updateTotalAmounts();">
				<option value="g">Gram</option>
			  	<option value="t">Tola</option>
			</select>
		</td>
		<td></td>
    </tr>
    <tr>
    	<th>Silver Price Total:</th>
    	<td colspan="3"><input class="w-50" type="number" name="silverPriceTotal" id="silverPriceTotal" min="0">&nbsp;<b>Rs</b></td>
    </tr>
    <tr>
    	<th>Others Amount:</th>
    	<td colspan="3"><input class="w-50" type="number" name="otherAmount" id="otherAmount" min="0" onchange="updateTotalAmounts();">&nbsp;<b>Rs</b></td>
    </tr>
    <tr class="table-success">
    	<th>Grand Total:</th>
    	<td colspan="3"><input class="w-50" type="number" name="grandTotal" id="grandTotal" min="0">&nbsp;<b>Rs</b></td>
    </tr>
    <tr>
	    <td colspan="4">
	    		<center>
	    			<button class="btn btn-primary" type="button" id="updateBtn"  onclick="calcZakat();">Calculate Zakat</button>
	    		</center>
	    </td>
    </tr>
    <tr class="table-success">
    	<th>Zakat Amount:</th>
    	<td colspan="3"><input class="w-50" type="number" name="zakatAmount" id="zakatAmount" min="0">&nbsp;<b>Rs</b></td>
     </tr>
  </table>

<script type="text/javascript">
	var result;
	var s1g = document.getElementById("s1g");
	var s1t = document.getElementById("s1t");
	var g24g1g = document.getElementById("24g1g");
	var g24g1t = document.getElementById("24g1t");
	var g22g1g = document.getElementById("22g1g");
	var g22g1t = document.getElementById("22g1t");

	var goldAmount = document.getElementById("goldAmount");
	var goldUnit = document.getElementById("goldUnit");
	var goldCarret = document.getElementById("goldCarret");
	var silverAmount = document.getElementById("silverAmount");
	var silverUnit = document.getElementById("silverUnit");
	var otherAmount = document.getElementById("otherAmount");
	var goldPriceTotal = document.getElementById("goldPriceTotal");
	var silverPriceTotal = document.getElementById("silverPriceTotal");
	var grandTotal = document.getElementById("grandTotal");
	var zakatAmount = document.getElementById("zakatAmount")

	var goldRateUpdated = false;
	var silverRateUpdated = false;
	var updateBtn = document.getElementById("updateBtn")

	function updateRates(){
		goldRateUpdated = false;
		silverRateUpdated = false;
		updateBtn.className = "btn btn-warning";
		updateBtn.innerHTML = "Updating.........";
		(async () => {
	  	const response = await fetch('https://hamariweb.com/finance/silver_rate/');
	  	const text = await response.text();
	  	result = text.match(/<td align="center">(.*?)<\/td>/g).map(function(val){
			return val.replace(/<\/?td>/g,'').replace(/<\/?td align="center">/g,'');
			});

	  	s1g.value = parseFloat(result[0].replace(/[^0-9]/g,""))/10;
	  	s1t.value = parseFloat(result[1].replace(/[^0-9]/g,""));
	  	// console.log(result);
	  	silverRateUpdated = true;
	  	if (silverRateUpdated && goldRateUpdated) {
	  		updateBtn.className = "btn btn-primary";
	  		updateBtn.innerHTML = "Update Rates";
	  	}
		})();

		(async () => {
	  	const response = await fetch('https://hamariweb.com/finance/gold_rate/');
	  	const text = await response.text();
	  	result = text.match(/<td align='center' class='bold_text'>(.*?)<\/td>/gs).map(function(val){
	  		val = val.replace(/<\/?td>/g,'');
	  		val = val.replace(/<\/?td align='center' class='bold_text'>/g,'')
	  		val = val.replace(/[^0-9]/g,"");
	  		val = parseFloat(val)
			return val;
			});

	  	g24g1g.value = result[0]/10;
	  	g24g1t.value = result[1];
	  	g22g1g.value = result[2]/10;
	  	g22g1t.value = result[3];
	  	console.log(result)
	  	goldRateUpdated = true;
	  	if (silverRateUpdated && goldRateUpdated) {
	  		updateBtn.className = "btn btn-primary";
	  		updateBtn.innerHTML = "Update Rates";
	  	}
		})();		
	}

	function updateTotalAmounts(){

		var rate = 0
		// for gold
		if(goldUnit.value == "g"){
			if(goldCarret.value == "22K"){
				rate = g22g1g.value;
			}else{
				rate = g24g1g.value;
			}
		}else{
			if(goldCarret.value == "22K"){
				rate = g22g1t.value;
			}else{
				rate = g24g1t.value;
			}
		}

		goldPriceTotal.value = goldAmount.value * rate;

		//for silver
		if(silverUnit.value == "g"){
			rate = s1g.value;
		}else{
			rate = s1t.value;
		}

		silverPriceTotal.value = silverAmount.value * rate;

		grandTotal.value = goldPriceTotal.value + silverPriceTotal.value + otherAmount.value;

	}

	function calcZakat()
	{
		zakatAmount.value = parseFloat(grandTotal.value) * 0.025;
	}

	// updateTotalAmounts();
	updateRates();
</script>

<style type="text/css">
	input { 
    text-align: center; 
	}
</style>


<?php
  include "footer.php"
?>