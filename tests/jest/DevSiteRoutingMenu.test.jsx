import React from 'react';
import { shallow } from 'enzyme';
import NavigationSideMenu from 'terra-navigation-side-menu';
import WrappedDevSiteRoutingMenu, { searchFilter, buildSideMenuItems } from '../../src/app/components/DevSiteRoutingMenu';

const DevSiteRoutingMenu = WrappedDevSiteRoutingMenu.WrappedComponent;

describe('DevSiteRoutingMenu', () => {
  describe('searchFilter', () => {
    it('should return true', () => {
      const by = 'menu item 1';
      const searchable = 'Menu Item 1';
      const result = searchFilter(by)(searchable);
      expect(result).toBe(true);
    });

    it('should return false', () => {
      const by = 'menu item 1';
      const searchable = 'not gonna find me';
      const result = searchFilter(by)(searchable);
      expect(result).toBe(false);
    });

    it('should find with regular expression characters', () => {
      const by = 'menu item 1\\';
      const searchable = 'Menu Item 1\\';
      const result = searchFilter(by)(searchable);
      expect(result).toBe(true);
    });
  });

  describe('buildSideMenuItems', () => {
    it('should return array of objects adhering to the NavigationSideMenu API', () => {
      const items = [{
        path: '/1',
        text: '1',
        hasSubMenu: true,
      }, {
        path: '/2',
        text: '2',
        hasSubMenu: false,
      }, {
        path: '/3',
        text: '3',
      }];

      const result = buildSideMenuItems(items);
      expect(result).toEqual([{
        key: '/1',
        text: '1',
        hasSubMenu: true,
        metaData: {
          path: '/1',
          hasSubMenu: true,
        },
      }, {
        key: '/2',
        text: '2',
        hasSubMenu: false,
        metaData: {
          path: '/2',
          hasSubMenu: false,
        },
      }, {
        key: '/3',
        text: '3',
        hasSubMenu: false,
        metaData: {
          path: '/3',
          hasSubMenu: false,
        },
      }]);
    });
  });

  describe('handleMenuChange', () => {
    const items = [{
      path: '/1',
      text: '1',
      hasSubMenu: true,
    }, {
      path: '/2',
      text: '2',
      hasSubMenu: false,
    }, {
      path: '/3',
      text: '3',
    }];

    it('should toggle the menu closed if no submenu is present for the selected item', () => {
      const mockRoutingStackDelegate = {
        showParent: () => {},
        show: jest.fn(),
      };

      const mockLayoutConfig = {
        toggleMenu: jest.fn().mockReturnValue(Promise.resolve()),
      };

      const devSiteRoutingMenu = (
        <DevSiteRoutingMenu
          location={{ pathname: '/2' }}
          routingStackDelegate={mockRoutingStackDelegate}
          layoutConfig={mockLayoutConfig}
          menuItems={items}
        />
      );

      const wrapper = shallow(devSiteRoutingMenu);

      expect(wrapper.state('selectedChildKey')).toBe('/2');

      const twoItem = wrapper.find(NavigationSideMenu).getElements()[0];

      return twoItem.props.onChange(undefined, {
        selectedMenuKey: 'devSiteRoutingMenuRootMenuKey',
        selectedChildKey: '/2',
        metaData: {
          path: '/2',
          hasSubMenu: false,
        },
      }).then(() => {
        wrapper.update();

        expect(wrapper.state('selectedChildKey')).toBe('/2');

        expect(mockLayoutConfig.toggleMenu.mock.calls.length).toBe(1);
      });
    });

    it('should not toggle the menu closed if menu toggling is not enabled', () => {
      const mockRoutingStackDelegate = {
        showParent: () => {},
        show: jest.fn(),
      };

      const mockLayoutConfig = {
        // No toggleMenu implementation included here, as would occur
        // at larger sizes.
      };

      const devSiteRoutingMenu = (
        <DevSiteRoutingMenu
          location={{ pathname: '/1' }}
          routingStackDelegate={mockRoutingStackDelegate}
          layoutConfig={mockLayoutConfig}
          menuItems={items}
        />
      );

      const wrapper = shallow(devSiteRoutingMenu);

      expect(wrapper.state('selectedChildKey')).toBe('/1');

      const twoItem = wrapper.find(NavigationSideMenu).getElements()[0];

      return twoItem.props.onChange(undefined, {
        selectedMenuKey: 'devSiteRoutingMenuRootMenuKey',
        selectedChildKey: '/1',
        metaData: {
          path: '/1',
          hasSubMenu: true,
        },
      }).then(() => {
        wrapper.update();

        expect(wrapper.state('selectedChildKey')).toBe('/1');
      });
    });

    it('should not toggle the menu closed if a submenu is present for the selected item', () => {
      const mockRoutingStackDelegate = {
        showParent: () => {},
        show: jest.fn(),
      };

      const mockLayoutConfig = {
        toggleMenu: jest.fn().mockReturnValue(Promise.resolve()),
      };

      const devSiteRoutingMenu = (
        <DevSiteRoutingMenu
          location={{ pathname: '/1' }}
          routingStackDelegate={mockRoutingStackDelegate}
          layoutConfig={mockLayoutConfig}
          menuItems={items}
        />
      );

      const wrapper = shallow(devSiteRoutingMenu);

      expect(wrapper.state('selectedChildKey')).toBe('/1');

      const oneItem = wrapper.find(NavigationSideMenu).getElements()[0];

      return oneItem.props.onChange(undefined, {
        selectedMenuKey: 'devSiteRoutingMenuRootMenuKey',
        selectedChildKey: '/1',
        metaData: {
          url: '/1',
          hasSubMenu: true,
        },
      }).then(() => {
        wrapper.update();

        expect(wrapper.state('selectedChildKey')).toBe('/1');

        expect(mockLayoutConfig.toggleMenu.mock.calls.length).toBe(0);
      });
    });
  });

  describe('Snapshot tests', () => {
    it('renders with given props', () => {
      const exampleMenu = (
        <DevSiteRoutingMenu
          menuItems={[{
            path: '/1',
            text: '1',
            hasSubMenu: false,
          }, {
            path: '/2',
            text: '2',
            hasSubMenu: true,
          }]}
          layoutConfig={{
            toggleMenu: jest.fn(),
          }}
          routingStackDelegate={{
            show: jest.fn(),
            showParent: jest.fn(),
          }}
          location={{
            pathname: '/1',
          }}
        />
      );

      const result = shallow(exampleMenu);

      expect(result).toMatchSnapshot();
    });

    it('renders a toolbar with 10 menuItems', () => {
      const times = n => f => [...Array(n)].map((_, i) => f(i));
      const tenMenuItems = times(10)(i => ({
        path: `/${i}`,
        text: `${i}`,
        hasSubMenu: i % 2 === 0,
      }));

      const menu = (
        <DevSiteRoutingMenu
          menuItems={tenMenuItems}
          layoutConfig={{ toggleMenu: jest.fn() }}
          routingStackDelegate={{
            show: jest.fn(),
            showParent: jest.fn(),
          }}
          location={{ pathname: '/1' }}
        />
      );

      const wrapper = shallow(menu);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
