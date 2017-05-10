var Parsers = function () {},
	Models = require('./models.js');

Parsers.prototype = {
	companyParser: function (line) {
		var currentToken = '',
			capacity = 0,
			companyName = '',
			preferredProfessionals = [];

		if (line == '') return null;

		for(var i = 0; i < line.length; i ++) {
			var currentChar = line.charAt(i);

			if (currentChar == ',') {
				if (capacity == 0) {
					capacity = parseInt(currentToken);
					currentToken = '';
					i ++;
					continue;
				} else {
					preferredProfessionals.push(currentToken.trim());
					currentToken = '';
					continue;
				}
			}

			if (currentChar == ':') {
				companyName = currentToken;
				currentToken = '';
				i ++;
				continue;
			}

		    currentToken = currentToken + currentChar;
		}

		if (currentToken.length > 0) 
			preferredProfessionals.push(currentToken.trim());

		return new Models.Company(capacity, 
			companyName, preferredProfessionals);
	},

	matchParser: function (line) {
		var currentToken = '',
			companyName = '',
			selectedProfessionals = [];

		if (line == '') return null;

		for(var i = 0; i < line.length; i ++) {
			var currentChar = line.charAt(i);

			if (currentChar == ',') {
				selectedProfessionals.push(currentToken);
				currentToken = '';
				i ++;
				continue;
			}

			if (currentChar == ':') {
				companyName = currentToken;
				currentToken = '';
				i ++;
				continue;
			}

		    currentToken = currentToken + currentChar;
		}

		if (currentToken.length) 
			selectedProfessionals.push(currentToken);

		return new Models.Match(companyName, selectedProfessionals);
	},

	professionalParser: function (line) {
		var currentToken = '',
			capacity = 0,
			professionalName = '',
			preferredCompanies = [];

		if (line == '') return null;

		for(var i = 0; i < line.length; i ++) {
			var currentChar = line.charAt(i);

			if (currentChar == ',') {
				preferredCompanies.push(currentToken.trim());
				currentToken = '';
				continue;
			}

			if (currentChar == ':') {
				professionalName = currentToken;
				currentToken = '';
				i ++;
				continue;
			}

		    currentToken = currentToken + currentChar;
		}

		if (currentToken.length) 
			preferredCompanies.push(currentToken);

		return new Models.Professional(
			professionalName, preferredCompanies);
	}
};

module.exports = new Parsers();
