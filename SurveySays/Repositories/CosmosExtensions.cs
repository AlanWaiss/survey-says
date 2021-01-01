using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace SurveySays.Repositories
{
	public static class CosmosExtensions
	{
		public static IServiceCollection UseCosmos( this IServiceCollection services ) => services
			.AddSingleton<CosmosClientFactory>()
			.AddSingleton<CosmosContainerFactory>();

		public static IServiceCollection UseCosmosGameRepository( this IServiceCollection services, IConfiguration configuration )
		{
			return services.Configure<CosmosGameOptions>( configuration.GetSection( CosmosGameOptions.SectionName ) )
				.AddTransient<IGameRepository>( services =>
				{
					var options = services.GetService<IOptions<CosmosGameOptions>>();
					var containerFactory = services.GetService<CosmosContainerFactory>();
					var container = containerFactory.GetContainer( options.Value );
					return new CosmosGameRepository( container );
				} );
		}

		public static IServiceCollection UseCosmosGroupRepository( this IServiceCollection services, IConfiguration configuration )
		{
			return services.Configure<CosmosGroupOptions>( configuration.GetSection( CosmosGroupOptions.SectionName ) )
				.AddTransient<IGroupRepository>( services =>
				{
					var options = services.GetService<IOptions<CosmosGroupOptions>>();
					var containerFactory = services.GetService<CosmosContainerFactory>();
					var container = containerFactory.GetContainer( options.Value );
					return new CosmosGroupRepository( container );
				} );
		}

		public static IServiceCollection UseCosmosSurveyRepository( this IServiceCollection services, IConfiguration configuration )
		{
			return services.Configure<CosmosSurveyOptions>( configuration.GetSection( CosmosSurveyOptions.SectionName ) )
				.AddTransient<ISurveyRepository>( services =>
				{
					var options = services.GetService<IOptions<CosmosSurveyOptions>>();
					var containerFactory = services.GetService<CosmosContainerFactory>();
					var container = containerFactory.GetContainer( options.Value );
					return new CosmosSurveyRepository( container );
				} );
		}
	}
}
