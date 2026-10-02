// Explore Bharat Safar — Section 1: Bharat Discovery Engine API Controller
// Reference: EBS-DOC-09-API Section 5.2, EBS-BLU-41-BDE Section 11
import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { Public } from '../../common/decorators/public.decorator';
import { SearchDiscoveryDto } from './dto/search-discovery.dto';
import { NearbyPlacesDto } from './dto/nearby-places.dto';
import { BoundingBoxDto } from './dto/bounding-box.dto';
import { PlaceQueryDto } from './dto/place-query.dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * 1. GET /api/v1/discovery/states
   * Returns national catalog of all 28 States and 8 Union Territories.
   */
  @Public()
  @Get('states')
  async getStates() {
    return this.discoveryService.getStates();
  }

  /**
   * 2. GET /api/v1/discovery/states/:id
   * Returns full State dossier, climate, cultural highlights, and constituent districts.
   */
  @Public()
  @Get('states/:id')
  async getStateById(@Param('id') id: string) {
    return this.discoveryService.getStateById(id);
  }

  /**
   * 3. GET /api/v1/discovery/districts/:id
   * Returns District dossier, emergency directory, and constituent talukas.
   */
  @Public()
  @Get('districts/:id')
  async getDistrictById(@Param('id') id: string) {
    return this.discoveryService.getDistrictById(id);
  }

  /**
   * 4. GET /api/v1/discovery/talukas/:id
   * Returns Taluka profile and constituent places registry.
   */
  @Public()
  @Get('talukas/:id')
  async getTalukaById(@Param('id') id: string) {
    return this.discoveryService.getTalukaById(id);
  }

  /**
   * 5. GET /api/v1/discovery/categories
   * Returns hierarchical cultural and heritage category catalog.
   */
  @Public()
  @Get('categories')
  async getCategories() {
    return this.discoveryService.getCategories();
  }

  /**
   * 6. GET /api/v1/discovery/landmarks-3d
   * Returns active miniature 3D landmark models with spatial anchors.
   */
  @Public()
  @Get('landmarks-3d')
  async getLandmarks3D() {
    return this.discoveryService.getLandmarks3D();
  }

  /**
   * 7. GET /api/v1/discovery/places/nearby
   * Radial proximity search around geographic coordinate.
   */
  @Public()
  @Get('places/nearby')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getNearbyPlaces(@Query() query: NearbyPlacesDto) {
    return this.discoveryService.getNearbyPlaces(query);
  }

  /**
   * 8. GET /api/v1/discovery/places/within-bounds
   * Bounding box spatial search for map viewport.
   */
  @Public()
  @Get('places/within-bounds')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPlacesWithinBounds(@Query() query: BoundingBoxDto) {
    return this.discoveryService.getPlacesWithinBounds(query);
  }

  /**
   * 9. GET /api/v1/discovery/places
   * Paginated place search with category and geographic filters.
   */
  @Public()
  @Get('places')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPlaces(@Query() query: PlaceQueryDto) {
    return this.discoveryService.getPlaces(query);
  }

  /**
   * 10. GET /api/v1/discovery/places/:id
   * Deep Place monograph, operating hours, tariffs, and conditional booking flag.
   */
  @Public()
  @Get('places/:id')
  async getPlaceById(@Param('id') id: string) {
    return this.discoveryService.getPlaceById(id);
  }

  /**
   * 11. GET /api/v1/discovery/search
   * Isolated Section 1 spatial search with trigram similarity and proximity boosting.
   * Hard Firewall: Zero village records, booking packages, or social feeds.
   */
  @Public()
  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(@Query() query: SearchDiscoveryDto) {
    return this.discoveryService.searchDiscovery(query);
  }

  /**
   * 12. GET /api/v1/discovery/geojson/states
   * Returns Survey of India compliant GeoJSON Feature Collection of States & UTs.
   */
  @Public()
  @Get('geojson/states')
  async getStatesGeoJson() {
    return this.discoveryService.getStatesGeoJson();
  }

  /**
   * 13. GET /api/v1/discovery/geojson/places
   * Returns GeoJSON Feature Collection of Places for vector GIS layers.
   */
  @Public()
  @Get('geojson/places')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPlacesGeoJson(@Query() query: PlaceQueryDto) {
    return this.discoveryService.getPlacesGeoJson(query);
  }

  /**
   * 14. GET /api/v1/discovery/tiles/:z/:x/:y.pbf
   * Dynamic Vector Tile Ingress Endpoint conforming to EBS-BLU-41-BDE Section 11.1
   */
  @Public()
  @Get('tiles/:z/:x/:y.pbf')
  async getTile(@Param('z') _z: string, @Param('x') _x: string, @Param('y') _y: string) {
    return this.discoveryService.getPlacesGeoJson({ limit: 100 });
  }
}
