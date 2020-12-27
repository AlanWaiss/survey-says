using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Ignore = Newtonsoft.Json.JsonIgnoreAttribute;
using JsonProperty = Newtonsoft.Json.JsonPropertyAttribute;

namespace SurveySays.Models
{
	public class Survey
	{
		[Ignore]
		[JsonIgnore]
		private List<SurveyAnswer> answers;

		[JsonProperty( "answers" )]
		[JsonPropertyName( "answers" )]
		public List<SurveyAnswer> Answers
		{
			get => answers ??= new List<SurveyAnswer>();
			set => answers = value;
		}

		[JsonProperty( "hostId" )]
		[JsonPropertyName( "hostId" )]
		[Required]
		public string HostId { get; set; }

		[Ignore]
		[JsonIgnore]
		private string id;

		[JsonProperty( "id" )]
		[JsonPropertyName( "id" )]
		public string Id
		{
			get => id ??= Guid.NewGuid().ToString().ToLower();
			set => id = value;
		}

		[JsonProperty( "question" )]
		[JsonPropertyName( "question" )]
		public string Question { get; set; }
	}
}