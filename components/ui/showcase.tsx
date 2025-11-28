"use client";

import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Input } from "./input";
import { StatCard } from "./stat-card";
import { Separator } from "./separator";
import { Swords, Zap, Shield, Sparkles } from "lucide-react";

export function ComponentShowcase() {
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent animate-shimmer">
          Panda Battle UI Components
        </h1>
        <p className="text-muted-foreground">
          Game-themed components for an epic battle experience
        </p>
      </div>

      <Separator />

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Buttons</h2>
        <Card variant="game">
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              Different button styles for various game actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Primary Button (Custom Game Style)
                </p>
                <Button variant="primary">START BATTLE</Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="game-secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="game">Game Action</Button>
              <Button variant="attack">Attack</Button>
              <Button variant="defend">Defend</Button>
              <Button variant="energy">Energy</Button>
              <Button variant="warning">Warning</Button>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="danger" size="sm">
                Small
              </Button>
              <Button variant="defend" size="default">
                Default
              </Button>
              <Button variant="attack" size="lg">
                Large
              </Button>
              <Button variant="energy" size="xl">
                Extra Large
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Badges</h2>
        <Card variant="glow">
          <CardHeader>
            <CardTitle>Stat Badges</CardTitle>
            <CardDescription>
              Colorful badges for displaying game stats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="strength">Strength: 85</Badge>
              <Badge variant="speed">Speed: 72</Badge>
              <Badge variant="endurance">Endurance: 90</Badge>
              <Badge variant="luck">Luck: 45</Badge>
              <Badge variant="rank">Rank #1</Badge>
              <Badge variant="win">10 Wins</Badge>
              <Badge variant="loss">3 Losses</Badge>
              <Badge variant="turns">5 Turns</Badge>
              <Badge variant="prize">Prize Pool</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stat Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Stat Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            label="Strength"
            value={85}
            variant="strength"
            icon={<Swords className="w-5 h-5 text-red-500" />}
          />
          <StatCard
            label="Speed"
            value={72}
            variant="speed"
            icon={<Zap className="w-5 h-5 text-cyan-500" />}
          />
          <StatCard
            label="Endurance"
            value={90}
            variant="endurance"
            icon={<Shield className="w-5 h-5 text-green-500" />}
          />
          <StatCard
            label="Luck"
            value={45}
            variant="luck"
            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          />
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="game">
            <CardHeader>
              <CardTitle>Game Card</CardTitle>
              <CardDescription>Emerald glow effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Perfect for general game content</p>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardHeader>
              <CardTitle>Glow Card</CardTitle>
              <CardDescription>Purple glow effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Great for special features</p>
            </CardContent>
          </Card>

          <Card variant="battle">
            <CardHeader>
              <CardTitle>Battle Card</CardTitle>
              <CardDescription>Red glow effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Ideal for combat screens</p>
            </CardContent>
          </Card>

          <Card variant="stat">
            <CardHeader>
              <CardTitle>Stat Card</CardTitle>
              <CardDescription>Cyan glow effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Perfect for displaying stats</p>
            </CardContent>
          </Card>

          <Card variant="highlight">
            <CardHeader>
              <CardTitle>Highlight Card</CardTitle>
              <CardDescription>Yellow glow effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Great for important info</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Input Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Inputs</h2>
        <Card variant="game">
          <CardHeader>
            <CardTitle>Input Fields</CardTitle>
            <CardDescription>
              Styled inputs for game interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Input</label>
              <Input placeholder="Enter text..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Game-styled Input</label>
              <Input variant="game" placeholder="Enter battle name..." />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Interactive Demo</h2>
        <Card variant="battle" className="overflow-hidden">
          <CardHeader className="bg-linear-to-r from-red-500/10 to-orange-500/10">
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-500 animate-pulse" />
              Battle Ready
            </CardTitle>
            <CardDescription>Your panda is ready for combat!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Power"
                value={292}
                maxValue={400}
                variant="strength"
                showProgress={true}
              />
              <div className="space-y-2">
                <Badge variant="rank" className="w-full justify-center py-2">
                  Rank #7
                </Badge>
                <Badge variant="win" className="w-full justify-center">
                  15 Wins
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="attack" className="flex-1">
                <Swords className="w-4 h-4" />
                Attack
              </Button>
              <Button variant="defend" className="flex-1">
                <Shield className="w-4 h-4" />
                Defend
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
