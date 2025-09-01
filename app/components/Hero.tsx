export const Hero = () => {
  return (
    <div
      className="hero"
      style={{
        backgroundImage:
          "url(https://plus.unsplash.com/premium_photo-1685207267343-1c8852b45575?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
      }}
    >
      <div className="hero-overlay my-96"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Ride the Future</h1>
          <p className="mb-5">
            Join the ultimate community for tech-savvy bikers in Indonesia.
            Share builds, ideas, and passion for biking.
          </p>
          <a className="btn btn-primary btn-lg" href="https://strava.com/clubs/geekbikeco" target="_blank">Join Now</a>
        </div>
      </div>
    </div>
  )
}