using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Ignore = Newtonsoft.Json.JsonIgnoreAttribute;
using JsonProperty = Newtonsoft.Json.JsonPropertyAttribute;

namespace SurveySays.Models
{
	public class Game
	{
		[JsonProperty( "answers" )]
		[JsonPropertyName( "answers" )]
		[Required]
		public SurveyAnswer[] Answers { get; set; }

		[JsonProperty( "hostId" )]
		[JsonPropertyName( "hostId" )]
		[Required]
		public string HostId { get; set; }

		[Ignore]
		[JsonIgnore]
		private string id;

		[JsonProperty( "id" )]
		[JsonPropertyName( "id" )]
		[Required]
		public string Id
		{
			get => id ??= Guid.NewGuid().ToString().ToLower();
			set => id = value;
		}

		[JsonProperty( "passcode" )]
		[JsonPropertyName( "passcode" )]
		public string Passcode { get; set; }

		[JsonProperty( "playerId" )]
		[JsonPropertyName( "playerId" )]
		public string PlayerId { get; set; }

		[JsonProperty( "question" )]
		[JsonPropertyName( "question" )]
		[Required]
		public string Question { get; set; }

		[JsonProperty( "surveyId" )]
		[JsonPropertyName( "surveyId" )]
		[Required]
		public string SurveyId { get; set; }

		[JsonProperty( "winnerId" )]
		[JsonPropertyName( "winnerId" )]
		public string WinnerId { get; set; }
	}
}
