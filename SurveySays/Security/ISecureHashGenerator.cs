namespace SurveySays.Security
{
	public interface ISecureHashGenerator
	{
		string GenerateHash( string input );
	}
}