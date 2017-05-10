#!/usr/bin/env node

'use strict';

var fs = require('fs'),
    async = require('async'),
    Promise = require('bluebird'),
    Parsers = require('./parsers.js'),
    Matchmaker = require('./matchmaker.js'),
    args = process.argv.slice(2),
    inputCompanies = args[0],
    inputProfessionals = args[1],
    inputMatches = args[2];

console.log("Started");

Promise.promisifyAll(fs);

async.parallel([
	function (callback) {
		fs.readFileAsync(inputCompanies, 'utf-8')
			.then(parseCompanies)
			.then(function (data) { callback(null, {companies: data}); });
	},

	function (callback) {
		fs.readFileAsync(inputProfessionals, 'utf-8')
			.then(parseProfessionals)
			.then(function (data) { callback(null, {professionals: data}); });		
	},

	function (callback) {
        fs.readFileAsync(inputMatches, 'utf-8')
            .then(parseMatches)
            .then(function (data) { callback(null, {matches: data}); });
    }

], function (err, combinedResults) {
	var companies = combinedResults
		.filter(function (o) {
			return o.companies != null;
		})[0].companies;

	var professionals = combinedResults
		.filter(function (o) {
			return o.professionals != null;
		})[0].professionals;

	var matches = combinedResults
		.filter(function (o) {
			return o.matches != null;
		})[0].matches;

	console.log( 
		validateCompaniesPresence(companies, matches)
			&& validateProfessionalsPresence(professionals, matches)
			&& validateCapacities(companies, matches)
			&& validateCouplings(companies, professionals, matches)
		? "Matches are valid"
		: "Matches are invalid");
});

function validateCompaniesPresence(companies, matches) {
	console.log("Validating companies presence.");

	for(var companyName in companies) {
		var match = matches.filter(function (match) {
			return match.companyName == companyName;
		});

		if (match.length == 0) { 
			console.log("Company", companyName, "has no matches.");
			return false;
		};
	}

	return true;
}

function validateProfessionalsPresence(professionals, matches) {
	console.log("Validating professionals presence.");

	for(var i = 0; i < professionals.length; i ++) {
		var professional = professionals[i];

		var match = matches.filter(function (match) {
			return match.selectedProfessionals.filter(function (selectedProfessional) {
				return selectedProfessional == professional.name;
			}).length > 0;
		});

		if (match.length == 0) {
			console.log("Professional", professional.name, "has no matches.");
		}
	}

	return true;
}

function validateCapacities(companies, matches) {
	console.log("Validating companies capacities.");

	for(var companyName in companies) {
		var match = matches.filter(function (match) {
			return match.companyName == companyName;
		})[0];

		if (match.selectedProfessionals.length !== companies[companyName].capacity) { 
			console.log("Company", companyName, "has capacity", 
				companies[companyName].capacity, ", while the match has only",
				match.selectedProfessionals.length, "selected professionals.");

			return false;
		};
	}

	return true;
}

function validateCouplings(companies, professionals, matches) {
	process.stdout.write("Validating couplings: ");

	var totalErrors = 0;

	for (var i = 0; i < professionals.length; i ++) {
		process.stdout.write(".");

		var professional = professionals[i];

		var professionalMatch = matches
			.filter(function (m) {
				return m.selectedProfessionals.filter(function (p) {
					return p == professional.name;
				}).length > 0;
			})[0];

		var companyRank = professional.preferredCompanies
			.map(function (c, idx) { return [c, idx]; })
			.filter(function (g) { return g[0] == professionalMatch.companyName; })
			[0][1];

		// if any of the more preferable companies prefers this candidate over one hired,
		// then we have a penalty point.
		for (var j = 0; j < companyRank; j ++) {
			var preferredCompany = companies[professional.preferredCompanies[j]];
			var professionalRank = preferredCompany.preferredProfessionals[professional.name];
			var companyMatch = matches
					.filter(function (m) {
						return m.companyName == preferredCompany.name;
					})[0];
			var professionalIsPreferable = companyMatch.selectedProfessionals
				.map(function (p) {
					return preferredCompany.preferredProfessionals[p];
				}).filter(function (r) {
					return r > professionalRank;
				}).length > 0;

			if (professionalIsPreferable) {
				totalErrors ++;
				console.log("\nProfessional", "[" + professional.name + "]", 
					"would prefer to work in", "[" + preferredCompany.name + "]", 
					"which in turn prefers him more than some of her current matches.");
			}
		}
	}

	console.log("\nTotal match errors", totalErrors);

	return totalErrors == 0;
}

function parseCompanies(data) {
	return data.split('\n')
		.map(Parsers.companyParser)
		.filter(function (o) { return o != null; })
		.reduce(function (acc, val) {
			acc[val.name] = val;
			return acc;
		}, {});
}

function parseProfessionals(data) {
	return data.split('\n')
		.map(Parsers.professionalParser)
		.filter(function (o) { return o != null; });
}

function parseMatches(data) {
	return data.split('\n')
		.map(Parsers.matchParser)
		.filter(function (o) { return o != null; });
}
