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
    outputFile = args[2], 
    start = process.hrtime();

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

	Matchmaker.matchGaleShapley(companies, professionals);

	var fs = require('fs');
	var stream = fs.createWriteStream("matches.csv");

	stream.once('open', function(fd) {
		for(var key in companies) {
			var company = companies[key];

			stream.write(company.name);
			stream.write(': ');

			var professionalNames = company.selectedProfessionals.map(function (professional) {
				return professional.name;
			}).join(', ');

			stream.write(professionalNames);
			stream.write('\n');
		};

		stream.end();
	});

	var total_time = process.hrtime(start);

	console.log("Done. Total execution time (seconds):", total_time[0] + (total_time[1] / 1000000000));
});

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
