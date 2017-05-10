var Matchmaker = function () {};

Matchmaker.prototype = {
	matchGaleShapley: function (companies, professionals) {
		var freeProfessionals = professionals.slice(0),
			count = 0;

		while(freeProfessionals.length > 0) {
			var professional = freeProfessionals[0];

			while(professional.preferredCompanies.length > 0) {
				var companyName = professional.preferredCompanies.shift();
				var company = companies[companyName];

				if (company.capacity > 0) {
					company.capacity --;
					professional.selectedCompany = company.name;
					company.selectedProfessionals.push(professional);
					freeProfessionals.shift();

					break;
				}

				var thisProfessionalsRank = company
						.preferredProfessionals[professional.name],
					shouldReplace = Number.MAX_SAFE_INTEGER,
					leastPreferredProRank = 0;

				for(var j = 0; j < company.selectedProfessionals.length; j ++) {
					var selectedProfessional = company.selectedProfessionals[j],
						selectedProfessionalsRank = company
							.preferredProfessionals[selectedProfessional.name];

					if (thisProfessionalsRank < selectedProfessionalsRank) {
						leastPreferredProRank = 
							Math.max(selectedProfessionalsRank, leastPreferredProRank);

						if (leastPreferredProRank == selectedProfessionalsRank)
							shouldReplace = j;
					}
				}

				if (shouldReplace < Number.MAX_SAFE_INTEGER) {
					var professionalToFree = company.selectedProfessionals[shouldReplace];
					professionalToFree.selectedCompany = null;
					company.selectedProfessionals[shouldReplace] = professional;
					professional.selectedCompany = company.name;
					freeProfessionals.shift();
					freeProfessionals.push(professionalToFree);

					break;
				}
			}
		}
	}
};

module.exports = new Matchmaker();
