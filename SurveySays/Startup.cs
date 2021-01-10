using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;
using Microsoft.OpenApi.Models;
using SurveySays.Hubs;
using SurveySays.Repositories;
using SurveySays.Security;

namespace SurveySays
{
	public class Startup
	{
		public Startup( IConfiguration configuration )
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices( IServiceCollection services )
		{
			services.AddControllers();
			services.AddControllersWithViews()
				.AddMicrosoftIdentityUI();
			services.AddMicrosoftIdentityWebAppAuthentication( Configuration, "AzureAdB2C" );
			services.AddSignalR();

			services.AddSwaggerGen( c =>
			{
				c.SwaggerDoc( "v1", new OpenApiInfo { Title = "SurveySays", Version = "v1" } );
			} );

			services.UseSecureHashGenerator( Configuration );

			services
				.UseCosmos()
				.UseCosmosGameRepository( Configuration )
				.UseCosmosGroupRepository( Configuration )
				.UseCosmosSurveyRepository( Configuration );
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure( IApplicationBuilder app, IWebHostEnvironment env )
		{
			if( env.IsDevelopment() )
			{
				app.UseDeveloperExceptionPage();
				app.UseSwagger();
				app.UseSwaggerUI( c => c.SwaggerEndpoint( "/swagger/v1/swagger.json", "SurveySays v1" ) );
			}

			app.UseHttpsRedirection();

			app.UseStaticFiles();

			app.UseRouting();

			app.UseAuthentication();
			app.UseAuthorization();

			app.UseEndpoints( endpoints =>
			{
				endpoints.MapControllers();
				endpoints.MapHub<GameHub>( "/gameHub" );
			} );
		}
	}
}
