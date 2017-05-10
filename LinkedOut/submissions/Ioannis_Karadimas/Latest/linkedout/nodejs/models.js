var Models = function () {};

Models.prototype = {
	Company: function (capacity, name, preferredProfessionals) {
	   	this.capacity = capacity;
	   	this.name = name;
	   	var init = {};
	   
	   	init[preferredProfessionals[preferredProfessionals.length - 1]] = 
	   	preferredProfessionals.length;

	   	this.preferredProfessionals = preferredProfessionals
	   	.reduce(function (acc, val, idx) {
			acc[val] = idx + 1; // rank of preference; smaller is better.
			return acc;
		}, init);

	   	this.selectedProfessionals = [];
	},

	Professional: function (name, preferredCompanies) {
		this.name = name;
		this.preferredCompanies = preferredCompanies;
		this.selectedCompany = null;
	},

	Match: function (companyName, selectedProfessionals) {
		this.companyName = companyName;
		this.selectedProfessionals = selectedProfessionals;
	}
};

module.exports = new Models();