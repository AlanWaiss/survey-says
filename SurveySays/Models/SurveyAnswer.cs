using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace SurveySays.Models
{
	/// <summary>
	/// Represents an answer to the survey question
	/// </summary>
	public class SurveyAnswer
	{
		/// <summary>
		/// The number of people that gave this answer to the survey question.
		/// </summary>
		[JsonProperty( "score" )]
		[JsonPropertyName( "score" )]
		public int Score { get; set; }

		/// <summary>
		/// The answer to this survey question.
		/// </summary>
		[JsonProperty( "text" )]
		[JsonPropertyName( "text" )]
		public string Text { get; set; }

		public SurveyAnswer()
		{
		}

		public SurveyAnswer( string text, int score = 0 )
		{
			Text = text;
			Score = score;
		}
	}
}