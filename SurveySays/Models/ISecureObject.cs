namespace SurveySays.Models
{
	public interface ISecureObject
	{
		string Id { get; set; }

		string HostId { get; set; }

		string SecurityHash { get; set; }
	}
}
